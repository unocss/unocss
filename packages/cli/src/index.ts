import { existsSync, promises as fs } from 'node:fs'
import { basename, dirname, normalize, relative, resolve } from 'pathe'
import fg from 'fast-glob'
import consola from 'consola'
import { cyan, dim, green } from 'colorette'
import { debounce } from 'perfect-debounce'
import { toArray } from '@unocss/core'
import type { SourceCodeTransformerEnforce, UserConfig } from '@unocss/core'
import { version } from '../package.json'
import { createContext } from '../../shared-integration/src/context'
import { applyTransformers } from '../../shared-integration/src/transformers'
import { PrettyError, handleError } from './errors'
import { defaultConfig } from './config'
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

  consola.log(green(`${name} v${version}`))
  consola.start(`UnoCSS ${options.watch ? 'in watch mode...' : 'for production...'}`)

  const debouncedBuild = debounce(
    async () => {
      generate(options).catch(handleError)
    },
    100,
  )

  const startWatcher = async () => {
    if (!options.watch)
      return

    const { watch } = await import('chokidar')
    const { patterns } = options
    const ignored = ['**/{.git,node_modules}/**']

    const watcher = watch(patterns, {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored,
      cwd,
    })

    if (configSources.length)
      watcher.add(configSources)

    watcher.on('all', async (type, file) => {
      const absolutePath = resolve(cwd, file)

      if (configSources.includes(absolutePath)) {
        await ctx.reloadConfig()
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
      `Watching for changes in ${
        toArray(patterns)
          .map(i => cyan(i))
          .join(', ')}`,
    )
  }

  await generate(options)

  await startWatcher().catch(handleError)

  function transformFiles(sources: { id: string; code: string; transformedCode?: string | undefined }[], enforce: SourceCodeTransformerEnforce = 'default') {
    return Promise.all(
      sources.map(({ id, code, transformedCode }) => new Promise<{ id: string; code: string; transformedCode: string | undefined }>((resolve) => {
        applyTransformers(ctx, code, id, enforce)
          .then((transformsRes) => {
            resolve({ id, code, transformedCode: transformsRes?.code || transformedCode })
          })
      })))
  }

  async function generate(options: ResolvedCliOptions) {
    const sourceCache = Array.from(fileCache).map(([id, code]) => ({ id, code }))

    const outFile = resolve(options.cwd || process.cwd(), options.outFile ?? 'uno.css')

    const preTransform = await transformFiles(sourceCache, 'pre')
    const defaultTransform = await transformFiles(preTransform)
    const postTransform = await transformFiles(defaultTransform, 'post')

    // update source file
    await Promise.all(
      postTransform.filter(({ transformedCode }) => !!transformedCode)
        .map(({ transformedCode, id }) => new Promise<void>((resolve) => {
          if (existsSync(id))
            fs.writeFile(id, transformedCode as string, 'utf-8').then(resolve)
        })),
    )

    const { css, matched } = await ctx.uno.generate(
      [...postTransform.map(({ code, transformedCode }) => transformedCode ?? code)].join('\n'),
      {
        preflights: options.preflights,
        minify: options.minify,
      },
    )

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
