import { readFile, stat } from 'fs/promises'
import type { UnoGenerator } from '@unocss/core'
import fg from 'fast-glob'
import type { Result, Root } from 'postcss'
import postcss from 'postcss'
import { createGenerator, warnOnce } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { defaultIncludeGlobs } from '../../shared-integration/src/defaults'
import { parseApply } from './apply'
import { parseTheme } from './theme'
import { parseScreen } from './screen'
import type { UnoPostcssPluginOptions } from './types'

export * from './types'

function unocss({ content, directiveMap, cwd, configOrPath }: UnoPostcssPluginOptions = {
  cwd: process.cwd(),
}) {
  const fileMap = new Map()
  const fileClassMap = new Map()
  const classes = new Set<string>()
  const config = loadConfig(cwd, configOrPath)
  let uno: UnoGenerator

  warnOnce(
    '`@unocss/postcss` package is in an experimental state right now. '
    + 'It doesn\'t follow semver, and may introduce breaking changes in patch versions.',
  )
  return {
    postcssPlugin: 'unocss',
    plugins: [
      async function (root: Root, result: Result) {
        const cfg = await config

        if (!Object.keys(!cfg.config))
          throw new Error('UnoCSS config file not found.')

        if (!uno)
          uno = createGenerator(cfg.config)

        parseApply(root, uno, directiveMap?.apply || 'apply')
        parseTheme(root, uno, directiveMap?.theme || 'theme')
        parseScreen(root, uno, directiveMap?.screen || 'screen')

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
        })

        if (result.opts.from?.split('?')[0].endsWith('.css')) {
          result.messages.push({
            type: 'dependency',
            plugin: 'unocss',
            file: result.opts.from,
            parent: result.opts.from,
          })

          await Promise.all(
            [
              ...rawContent.map(async (v) => {
                const { matched } = await uno.generate(v.raw, {
                  id: `unocss${v.extension}`,
                })

                for (const candidate of matched)
                  classes.add(candidate)
              }),
              ...entries.map(async (file) => {
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
              }),
            ],
          )
          for (const set of fileClassMap.values()) {
            for (const candidate of set)
              classes.add(candidate)
          }
          const c = await uno.generate(classes)
          classes.clear()
          const excludes: string[] = []
          root.walkAtRules('unocss', (rule) => {
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
          root.walkAtRules('unocss', (rule) => {
            if (!rule.params) {
              const source = rule.source
              const css = postcss.parse(c.getLayers(undefined, excludes) || '')
              css.walkDecls((declaration) => {
                declaration.source = source
              })
              rule.replaceWith(css)
            }
          })
        }
      },
    ],
  }
}

unocss.postcss = true

export default unocss
