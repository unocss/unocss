import { readFile } from 'fs/promises'
import type { UnoGenerator } from '@unocss/core'
import fg from 'fast-glob'
import type { Result, Root } from 'postcss'
import postcss from 'postcss'
import { createGenerator, warnOnce } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { defaultIncludeGlobs } from '../../shared-integration/src/defaults'
import { parseApply } from './apply'
import { parseTheme, themeFnRE } from './theme'
import { parseScreen } from './screen'
import type { UnoPostcssPluginOptions } from './types'

export * from './types'

function unocss(options: UnoPostcssPluginOptions = {}) {
  warnOnce(
    '`@unocss/postcss` package is in an experimental state right now. '
    + 'It doesn\'t follow semver, and may introduce breaking changes in patch versions.',
  )

  const {
    cwd = process.cwd(),
    directiveMap = {
      apply: 'apply',
      theme: 'theme',
      screen: 'screen',
      unocss: 'unocss',
    },
    content,
    configOrPath,
  } = options

  const fileMap = new Map()
  const fileClassMap = new Map()
  const classes = new Set<string>()
  const targetCache = new Set<string>()
  const config = loadConfig(cwd, configOrPath)

  let uno: UnoGenerator
  let promises: Promise<void>[] = []
  const targetRE = new RegExp(Object.values(directiveMap).join('|'))

  return {
    postcssPlugin: directiveMap.unocss,
    plugins: [
      async function (root: Root, result: Result) {
        if (!result.opts.from?.split('?')[0].endsWith('.css'))
          return

        let isTarget = false

        if (targetRE.test(root.toString())) {
          if (!targetCache.has(result.opts.from)) {
            root.walkAtRules((rule) => {
              if (
                rule.name === directiveMap.unocss
              || rule.name === directiveMap.apply
              || rule.name === directiveMap.theme
              || rule.name === directiveMap.screen
              )
                isTarget = true
            })

            if (!isTarget) {
              const themeFn = themeFnRE(directiveMap.theme)
              root.walkDecls((decl) => {
                if (themeFn.test(decl.value))
                  isTarget = true
              })
            }
          }
          else {
            isTarget = true
          }
        }
        else if (targetCache.has(result.opts.from)) {
          targetCache.delete(result.opts.from)
        }

        if (!isTarget)
          return
        else
          targetCache.add(result.opts.from)

        const cfg = await config
        if (!Object.keys(cfg.config).length)
          throw new Error('UnoCSS config file not found.')

        if (!uno)
          uno = createGenerator(cfg.config)

        const globs = content?.filter(v => typeof v === 'string') as string[] ?? defaultIncludeGlobs
        const rawContent = content?.filter(v => typeof v === 'object') as {
          raw: string
          extension: string
        }[] ?? []

        const entries = await fg(globs, {
          cwd,
          dot: true,
          absolute: true,
          ignore: ['**/{.git,node_modules}/**'],
          stats: true,
        }) as unknown as { path: string; mtimeMs: number }[]

        result.messages.push({
          type: 'dependency',
          plugin: directiveMap.unocss,
          file: result.opts.from,
          parent: result.opts.from,
        })

        await parseApply(root, uno, directiveMap.apply)
        await parseTheme(root, uno, directiveMap.theme)
        await parseScreen(root, uno, directiveMap.screen)

        promises.push(
          ...rawContent.map(async (v) => {
            const { matched } = await uno.generate(v.raw, {
              id: `unocss.${v.extension}`,
            })

            for (const candidate of matched)
              classes.add(candidate)
          }),
          ...entries.map(async ({ path: file, mtimeMs }) => {
            result.messages.push({
              type: 'dependency',
              plugin: directiveMap.unocss,
              file,
              parent: result.opts.from,
            })

            if (fileMap.has(file) && mtimeMs <= fileMap.get(file))
              return

            else
              fileMap.set(file, mtimeMs)

            const content = await readFile(file, 'utf8')
            const { matched } = await uno.generate(content, {
              id: file,
            })

            fileClassMap.set(file, matched)
          }),
        )
        await Promise.all(promises)
        promises = []
        for (const set of fileClassMap.values()) {
          for (const candidate of set)
            classes.add(candidate)
        }
        const c = await uno.generate(classes)
        classes.clear()
        const excludes: string[] = []
        root.walkAtRules(directiveMap.unocss, (rule) => {
          if (rule.params) {
            const source = rule.source
            const layers = rule.params.split(',').map(v => v.trim())
            const css = postcss.parse(
              layers
                .map(i => (i === 'all' ? c.getLayers() : c.getLayer(i)) || '')
                .filter(Boolean)
                .join('\n'),
            )
            css.walkDecls((declaration) => {
              declaration.source = source
            })
            rule.replaceWith(css)
            excludes.push(rule.params)
          }
        })
        root.walkAtRules(directiveMap.unocss, (rule) => {
          if (!rule.params) {
            const source = rule.source
            const css = postcss.parse(c.getLayers(undefined, excludes) || '')
            css.walkDecls((declaration) => {
              declaration.source = source
            })
            rule.replaceWith(css)
          }
        })
      },
    ],
  }
}

unocss.postcss = true

export default unocss
