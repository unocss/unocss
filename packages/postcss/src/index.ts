import { readFile, stat } from 'fs/promises'
import type { StringifiedUtil, UnoGenerator } from '@unocss/core'
import fg from 'fast-glob'
import type { Result, Root } from 'postcss'
import postcss from 'postcss'
import MagicString from 'magic-string'
import type { Rule, Selector, SelectorList } from 'css-tree'
import { clone, generate, parse } from 'css-tree'
import { createGenerator, expandVariantGroup, notNull, regexScopePlaceholder } from '@unocss/core'
import { loadConfig } from '@unocss/config'

import type { Theme } from '@unocss/preset-mini'

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

function parseScreen(root: Root, uno: UnoGenerator, directiveName: string) {
  // @ts-expect-error types
  root.walkAtRules(directiveName, async (rule) => {
    let breakpointName = ''
    let prefix = ''

    if (rule.params)
      breakpointName = rule.params.trim()

    if (!breakpointName)
      return

    const match = breakpointName.match(/^(?:(lt|at)-)?(\w+)$/)
    if (match) {
      prefix = match[1]
      breakpointName = match[2]
    }

    const resolveBreakpoints = () => {
      let breakpoints: Record<string, string> | undefined
      if (uno.userConfig && uno.userConfig.theme)
        breakpoints = (uno.userConfig.theme as Theme).breakpoints

      if (!breakpoints)
        breakpoints = (uno.config.theme as Theme).breakpoints

      return breakpoints
    }
    const variantEntries: Array<[string, string, number]> = Object.entries(resolveBreakpoints() ?? {}).map(([point, size], idx) => [point, size, idx])
    const generateMediaQuery = (breakpointName: string, prefix?: string) => {
      const [, size, idx] = variantEntries.find(i => i[0] === breakpointName)!
      if (prefix) {
        if (prefix === 'lt')
          return `(max-width: ${calcMaxWidthBySize(size)})`
        else if (prefix === 'at')
          return `(min-width: ${size})${variantEntries[idx + 1] ? ` and (max-width: ${calcMaxWidthBySize(variantEntries[idx + 1][1])})` : ''}`

        else throw new Error(`breakpoint variant not supported: ${prefix}`)
      }
      return `(min-width: ${size})`
    }

    if (!variantEntries.find(i => i[0] === breakpointName))
      throw new Error(`breakpoint ${breakpointName} not found`)

    rule.name = 'media'
    rule.params = `${generateMediaQuery(breakpointName, prefix)}`
  })
}

function calcMaxWidthBySize(size: string) {
  const value = size.match(/^-?[0-9]+\.?[0-9]*/)?.[0] || ''
  const unit = size.slice(value.length)
  const maxWidth = (parseFloat(value) - 0.1)
  return Number.isNaN(maxWidth) ? size : `${maxWidth}${unit}`
}

function parseApply(root: Root, uno: UnoGenerator, directiveName: string) {
  // @ts-expect-error types doesn't allow async callback but it seems work
  root.walkAtRules(directiveName, async (rule) => {
    if (!rule.parent)
      return

    const source = rule.source
    const classNames = expandVariantGroup(rule.params)
      .split(/\s+/g)
      .map(className => className.trim().replace(/\\/, ''))
    const utils = (await Promise.all(
      classNames.map(i => uno.parseToken(i, '-')),
    ))
      .filter(notNull).flat()
      .sort((a, b) => a[0] - b[0])
      .sort((a, b) => (a[3] ? uno.parentOrders.get(a[3]) ?? 0 : 0) - (b[3] ? uno.parentOrders.get(b[3]) ?? 0 : 0))
      .reduce((acc, item) => {
        const target = acc.find(i => i[1] === item[1] && i[3] === item[3])
        if (target)
          target[2] += item[2]
        else
          // use spread operator to prevent reassign to uno internal cache
          acc.push([...item] as Writeable<StringifiedUtil>)
        return acc
      }, [] as Writeable<StringifiedUtil>[])

    if (!utils.length)
      return

    for (const i of utils) {
      const [, _selector, body, parent] = i
      const selector = _selector?.replace(regexScopePlaceholder, ' ') || _selector

      if (parent || (selector && selector !== '.\\-')) {
        const node = parse(rule.parent.toString(), {
          context: 'rule',
        }) as Rule
        let newSelector = generate(node.prelude)
        if (selector && selector !== '.\\-') {
          const selectorAST = parse(selector, {
            context: 'selector',
          }) as Selector

          const prelude = clone(node.prelude) as SelectorList

          prelude.children.forEach((child) => {
            const parentSelectorAst = clone(selectorAST) as Selector
            parentSelectorAst.children.forEach((i) => {
              if (i.type === 'ClassSelector' && i.name === '\\-')
                Object.assign(i, clone(child))
            })
            Object.assign(child, parentSelectorAst)
          })
          newSelector = generate(prelude)
        }

        let css = `${newSelector}{${body}}`
        if (parent)
          css = `${parent}{${css}}`

        const css_parsed = postcss.parse(css)
        css_parsed.walkDecls((declaration) => {
          declaration.source = source
        })
        rule.parent.after(css_parsed)
      }
      else {
        const css = postcss.parse(body)
        css.walkDecls((declaration) => {
          declaration.source = source
        })
        rule.parent.append(css)
      }
    }

    rule.remove()
  })
}
function parseTheme(root: Root, uno: UnoGenerator, directiveName: string) {
  const themeFnRE = new RegExp(`${directiveName}\\((.*?)\\)`, 'g')
  root.walkDecls((decl) => {
    const matches = Array.from(decl.value.matchAll(themeFnRE))

    if (!matches.length)
      return

    for (const match of matches) {
      const rawArg = match[1].trim()
      if (!rawArg)
        throw new Error(`${directiveName}() expect exact one argument, but got 0`)

      let value = uno.config.theme as Record<string, any>
      const keys = rawArg.slice(1, -1).split('.')

      keys.every((key) => {
        if (value[key] != null)
          value = value[key]
        else if (value[+key] != null)
          value = value[+key]
        else
          return false
        return true
      })

      if (typeof value === 'string') {
        const code = new MagicString(decl.value)
        code.overwrite(
          match.index!,
          match.index! + match[0].length,
          value,
        )
        decl.value = code.toString()
      }
      // else if (throwOnMissing) {
      //   throw new Error(`theme of "${rawArg.slice(1, -1)}" did not found`)
      // }
    }
  })
}

interface PluginOptions {
  content?: string[]
  directiveMap?: {
    apply: string
    screen: string
    theme: string
  }
}

function unocss({ content, directiveMap }: PluginOptions = {}) {
  const fileMap = new Map()
  const fileClassMap = new Map()
  const classes = new Set<string>()
  const config = loadConfig()
  let uno: UnoGenerator
  return {
    postcssPlugin: 'unocss',
    plugins: [
      async function (root: Root, result: Result) {
        const cfg = await config

        if (!cfg.sources.length)
          throw new Error('UnoCSS config file not found.')

        if (!uno)
          uno = createGenerator(cfg.config)

        parseApply(root, uno, directiveMap?.apply || 'apply')
        parseTheme(root, uno, directiveMap?.theme || 'theme')
        parseScreen(root, uno, directiveMap?.screen || 'screen')

        const entries = await fg(content ?? ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro}'], {
          dot: true,
          absolute: true,
          ignore: ['**/{.git,node_modules}/**'],
        })
        if (result.opts.from?.split('?')[0].endsWith('.css')) {
          result.messages.push({
            type: 'dependency',
            plugin: 'unocss',
            file: result.opts.from,
            parent: result.opts.from,
          })
          let found = false
          root.walkAtRules('unocss', () => {
            found = true
          })
          if (found) {
            await Promise.all(entries.map(async (file) => {
              result.messages.push({
                type: 'dependency',
                plugin: 'unocss',
                file,
                parent: result.opts.from,
              })

              const { mtimeMs } = await stat(file)
              if (fileMap.has(file) && mtimeMs <= fileMap.get(file))
                return

              else
                fileMap.set(file, mtimeMs)

              const content = await readFile(file, 'utf8')
              const { matched } = await uno.generate(content, {
                id: file,
              })

              fileClassMap.set(file, matched)
            }))
            for (const set of fileClassMap.values()) {
              for (const candidate of set)
                classes.add(candidate)
            }
            const c = await uno.generate(classes)
            classes.clear()
            const excludes: string[] = []
            root.walkAtRules('unocss', (rule) => {
              const source = rule.source
              if (rule.params) {
                const layers = rule.params.split(',').map(v => v.trim())
                const css = postcss.parse(c.getLayers(layers) || '')
                css.walkDecls((declaration) => {
                  declaration.source = source
                })
                rule.replaceWith(css)
                excludes.push(rule.params)
                return
              }
              const css = postcss.parse(c.getLayers(undefined, excludes) || '')
              css.walkDecls((declaration) => {
                declaration.source = source
              })
              rule.replaceWith(css)
            })
          }
        }
      },
    ],
  }
}

unocss.postcss = true

export default unocss
