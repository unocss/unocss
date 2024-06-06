// ESM-entry, lazy loaded the actual the plugin entry.

import { readFile, stat } from 'node:fs/promises'
import { normalize } from 'node:path'
import process from 'node:process'
import type { UnoGenerator } from '@unocss/core'
import fg from 'fast-glob'
import type { Result, Root } from 'postcss'
import postcss from 'postcss'
import { createGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { hasThemeFn } from '@unocss/rule-utils'
import { defaultFilesystemGlobs } from '../../shared-integration/src/defaults'
import { parseApply } from './apply'
import { parseTheme } from './theme'
import { parseScreen } from './screen'
import type { UnoPostcssPluginOptions } from './types'

export function createPlugin(options: UnoPostcssPluginOptions) {
  const {
    cwd = process.cwd(),
    configOrPath,
  } = options

  const directiveMap = Object.assign({
    apply: 'apply',
    theme: 'theme',
    screen: 'screen',
    unocss: 'unocss',
  }, options.directiveMap || {})

  const fileMap = new Map()
  const fileClassMap = new Map()
  const classes = new Set<string>()
  const targetCache = new Set<string>()
  const config = loadConfig(cwd, configOrPath)

  let uno: UnoGenerator
  let promises: Promise<void>[] = []
  let last_config_mtime = 0
  const targetRE = new RegExp(Object.values(directiveMap).join('|'))

  return async function plugin(root: Root, result: Result) {
    const from = result.opts.from?.split('?')[0]

    if (!from)
      return

    let isTarget = targetCache.has(from)
    const isScanTarget = root.toString().includes(`@${directiveMap.unocss}`)

    if (targetRE.test(root.toString())) {
      if (!isTarget) {
        root.walkAtRules((rule) => {
          if (
            rule.name === directiveMap.unocss
            || rule.name === directiveMap.apply
            || rule.name === directiveMap.screen
          ) {
            isTarget = true
          }

          if (isTarget)
            return false
        })

        if (!isTarget) {
          root.walkDecls((decl) => {
            if (hasThemeFn(decl.value)) {
              isTarget = true
              return false
            }
          })
        }
        else {
          targetCache.add(from)
        }
      }
    }
    else if (targetCache.has(from)) {
      targetCache.delete(from)
    }

    if (!isTarget)
      return

    try {
      const cfg = await config
      if (!uno) {
        uno = createGenerator(cfg.config)
      }
      else if (cfg.sources.length) {
        const config_mtime = (await stat(cfg.sources[0])).mtimeMs
        if (config_mtime > last_config_mtime) {
          uno = createGenerator((await loadConfig(cwd, configOrPath)).config)
          last_config_mtime = config_mtime
        }
      }
    }
    catch (error: any) {
      throw new Error (`UnoCSS config not found: ${error.message}`)
    }

    const globs = uno.config.content?.filesystem ?? defaultFilesystemGlobs
    const plainContent = uno.config.content?.inline ?? []

    const entries = await fg(isScanTarget ? globs : from, {
      cwd,
      absolute: true,
      ignore: ['**/node_modules/**'],
      stats: true,
    }) as unknown as { path: string, mtimeMs: number }[]

    await parseApply(root, uno, directiveMap.apply)
    await parseTheme(root, uno)
    await parseScreen(root, uno, directiveMap.screen)

    promises.push(
      ...plainContent.map(async (c, idx) => {
        if (typeof c === 'function')
          c = await c()
        if (typeof c === 'string')
          c = { code: c }
        const { matched } = await uno.generate(c.code, { id: c.id ?? `__plain_content_${idx}__` })

        for (const candidate of matched)
          classes.add(candidate)
      }),
    )
    await Promise.all(promises)
    promises = []

    const BATCH_SIZE = 500

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE)
      promises.push(...batch.map(async ({ path: file, mtimeMs }) => {
        result.messages.push({
          type: 'dependency',
          plugin: directiveMap.unocss,
          file: normalize(file),
          parent: from,
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
      }))
      await Promise.all(promises)
      promises = []
    }

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
  }
}
