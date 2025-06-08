// ESM-entry, lazy loaded the actual the plugin entry.

import type { UnoGenerator } from '@unocss/core'
import type { Result, Root } from 'postcss'
import type { UnoPostcssPluginOptions } from './types'
import { readFile, stat } from 'node:fs/promises'
import { normalize } from 'node:path'
import process from 'node:process'
import { defaultFilesystemGlobs } from '#integration/defaults'
import { createRecoveryConfigLoader } from '@unocss/config'
import { createGenerator } from '@unocss/core'
import { hasThemeFn } from '@unocss/rule-utils'
import postcss from 'postcss'
import { glob } from 'tinyglobby'
import { parseApply } from './apply'
import { parseScreen } from './screen'
import { parseTheme } from './theme'

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
  const loadConfig = createRecoveryConfigLoader()
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
        uno = await createGenerator(cfg.config)
      }
      else if (cfg.sources.length) {
        const config_mtime = (await stat(cfg.sources[0])).mtimeMs
        if (config_mtime > last_config_mtime) {
          uno = await createGenerator((await loadConfig()).config)
          last_config_mtime = config_mtime
        }
      }
    }
    catch (error: any) {
      throw new Error (`UnoCSS config not found: ${error.message}`)
    }

    const globs = uno.config.content?.filesystem ?? defaultFilesystemGlobs
    const needCheckNodeMoudules = globs.some(i => i.includes('node_modules'))
    const plainContent = uno.config.content?.inline ?? []

    const entries = await glob(isScanTarget ? globs : [from], {
      cwd,
      absolute: true,
      ignore: needCheckNodeMoudules ? undefined : ['**/node_modules/**'],
      expandDirectories: false,
    })

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
      promises.push(...batch.map(async (file) => {
        result.messages.push({
          type: 'dependency',
          plugin: directiveMap.unocss,
          file: normalize(file),
          parent: from,
        })

        const { mtimeMs } = await stat(file)

        if (fileMap.has(file) && mtimeMs <= fileMap.get(file))
          return

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
      const source = rule.source
      if (rule.params) {
        const excludeLayers = []
        const includeLayers = []

        for (const layer of rule.params.split(',')) {
          const name = layer.trim()
          if (!name)
            continue

          if (name.startsWith('!')) {
            if (name.slice(1)) {
              excludeLayers.push(name.slice(1))
            }
          }
          else {
            includeLayers.push(name)
          }
        }

        if (excludeLayers.length > 0 && includeLayers.length > 0) {
          console.warn(`Warning: Mixing normal and negated layer names in "@${directiveMap.unocss} ${rule.params}" is not recommended.`)
        }

        let result = ''

        if (includeLayers.length > 0) {
          result = includeLayers
            .map(i => (i === 'all' ? c.getLayers() : c.getLayer(i)) || '')
            .filter(Boolean)
            .join('\n')
          excludes.push(...includeLayers)
        }
        else if (excludeLayers.length > 0) {
          result = c.getLayers(undefined, excludeLayers) || ''
          excludes.push(...excludeLayers)
        }

        const css = postcss.parse(result)
        css.walkDecls((declaration) => {
          declaration.source = source
        })
        rule.replaceWith(css)
      }
      else {
        const css = postcss.parse(c.getLayers(undefined, excludes) || '')
        css.walkDecls((declaration) => {
          declaration.source = source
        })
        rule.replaceWith(css)
      }
    })
  }
}
