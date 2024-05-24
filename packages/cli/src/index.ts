import { existsSync, promises as fs } from 'node:fs'
import process from 'node:process'
import { basename, dirname, normalize, relative, resolve } from 'pathe'
import fg from 'fast-glob'
import { consola } from 'consola'
import { cyan, dim, green } from 'colorette'
import { debounce } from 'perfect-debounce'
import { toArray } from '@unocss/core'
import type { SourceCodeTransformerEnforce, UserConfig } from '@unocss/core'
import { createContext } from '../../shared-integration/src/context'
import { applyTransformers } from '../../shared-integration/src/transformers'
import { version } from '../package.json'
import { SKIP_COMMENT_RE } from '../../shared-integration/src/constants'
import { defaultConfig } from './config'
import { PrettyError, handleError } from './errors'
import { getWatcher } from './watcher'
import type { CliOptions, ResolvedCliOptions } from './types'

const name = 'unocss'

export async function resolveOptions(options: CliOptions) {
  if (!options.patterns?.length) {
    throw new PrettyError(
      `No glob patterns, try ${cyan(`${name} <path/to/**/*>`)}`,
    )
  }

  return options as ResolvedCliOptions
}

export async function build(_options: CliOptions) {
  const fileCache = new Map<string, string>()

  const cwd = _options.cwd || process.cwd()
  const options = await resolveOptions(_options)

  async function loadConfig() {
    const ctx = createContext<UserConfig>(options.config, defaultConfig)
    const configSources = (await ctx.updateRoot(cwd)).sources.map(i => normalize(i))
    return { ctx, configSources }
  }

  const { ctx, configSources } = await loadConfig()
  const files = await fg(options.patterns, { cwd, absolute: true })
  await Promise.all(
    files.map(async (file) => {
      fileCache.set(file, await fs.readFile(file, 'utf8'))
    }),
  )

  if (options.stdout && options.outFile) {
    consola.fatal(`Cannot use --stdout and --out-file at the same time`)
    return
  }

  consola.log(green(`${name} v${version}`))

  if (options.watch)
    consola.start('UnoCSS in watch mode...')
  else
    consola.start('UnoCSS for production...')

  const debouncedBuild = debounce(
    async () => {
      generate(options).catch(handleError)
    },
    100,
  )

  const startWatcher = async () => {
    if (!options.watch)
      return
    const { patterns } = options

    const watcher = await getWatcher(options)

    if (configSources.length)
      watcher.add(configSources)

    watcher.on('all', async (type, file) => {
      const absolutePath = resolve(cwd, file)

      if (configSources.includes(absolutePath)) {
        await ctx.reloadConfig()
        if (configSources.length)
          watcher.add(configSources)
        consola.info(`${cyan(basename(file))} changed, setting new config`)
      }
      else {
        consola.log(`${green(type)} ${dim(file)}`)

        if (type.startsWith('unlink'))
          fileCache.delete(absolutePath)
        else
          fileCache.set(absolutePath, await fs.readFile(absolutePath, 'utf8'))
      }

      debouncedBuild()
    })

    consola.info(
      `Watching for changes in ${toArray(patterns)
        .map(i => cyan(i))
        .join(', ')}`,
    )
  }

  await generate(options)

  await startWatcher().catch(handleError)

  function transformFiles(sources: { id: string, code: string, transformedCode?: string | undefined }[], enforce: SourceCodeTransformerEnforce = 'default') {
    return Promise.all(
      sources.map(({ id, code, transformedCode }) => new Promise<{ id: string, code: string, transformedCode: string | undefined }>((resolve) => {
        applyTransformers(ctx, code, id, enforce)
          .then((transformsRes) => {
            resolve({ id, code, transformedCode: transformsRes?.code || transformedCode })
          })
      })),
    )
  }

  async function generate(options: ResolvedCliOptions) {
    const sourceCache = Array.from(fileCache).map(([id, code]) => ({ id, code }))

    const preTransform = await transformFiles(sourceCache, 'pre')
    const defaultTransform = await transformFiles(preTransform)
    const postTransform = await transformFiles(defaultTransform, 'post')

    // update source file
    if (options.writeTransformed) {
      await Promise.all(
        postTransform
          .filter(({ transformedCode }) => !!transformedCode)
          .map(({ transformedCode, id }) => new Promise<void>((resolve) => {
            if (existsSync(id))
              fs.writeFile(id, transformedCode as string, 'utf-8').then(resolve)
          })),
      )
    }
    const firstIdType = postTransform[0].id.split('.').pop()!
    const isSameFileType = postTransform.every(({ id }) => id.split('.').pop() === firstIdType)
    let css!: string
    let matched: Set<string>
    if (isSameFileType) {
      // if all files are the same type, we can generate them all at once
      const { css: _css, matched: _matched } = await ctx.uno.generate(
        [...postTransform.map(({ code, transformedCode }) => (transformedCode ?? code).replace(SKIP_COMMENT_RE, ''))].join('\n'),
        {
          preflights: options.preflights,
          minify: options.minify,
          id: postTransform[0].id,
        },
      )
      css = _css
      matched = _matched
    }
    else {
      // if files are different types, we need to generate them one by one
      const result = await Promise.all(postTransform.map(({ code, transformedCode, id }) =>
        ctx.uno.generate(transformedCode ?? code, {
          preflights: options.preflights,
          minify: options.minify,
          id,
        })))
      const cssCollection: Record<string, string[]> = {}
      result.forEach(({ css, layers }) => {
        css
          .split(/\/\*.*?\*\//g) // Remove inline comments
          .filter(Boolean).forEach((c, i) => {
            if (!cssCollection[layers[i]]) {
              cssCollection[layers[i]] = c.split('\n')
            }
            else {
              // remove duplicates
              cssCollection[layers[i]] = [...new Set([...cssCollection[layers[i]], ...c.split('\n')])]
            }
          })
      })
      css = result[0].layers.map(layer => `/* layer: ${layer} */${cssCollection[layer].join('\n')}`).join('\n')
      matched = new Set(result.map(({ matched }) => [...matched]).flat())
    }

    if (options.stdout) {
      process.stdout.write(css)
      return
    }

    const outFile = resolve(options.cwd || process.cwd(), options.outFile ?? 'uno.css')
    const dir = dirname(outFile)
    if (!existsSync(dir))
      await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(outFile, css, 'utf-8')

    if (!options.watch) {
      consola.success(
        `${[...matched].length} utilities generated to ${cyan(
          relative(process.cwd(), outFile),
        )}\n`,
      )
    }
  }
}
