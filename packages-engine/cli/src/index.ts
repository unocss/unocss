import type { SourceCodeTransformerEnforce, UserConfig } from '@unocss/core'
import type { CliOptions, ResolvedCliOptions } from './types'
import { existsSync, promises as fs } from 'node:fs'
import process from 'node:process'
import { SKIP_COMMENT_RE } from '#integration/constants'
import { createContext } from '#integration/context'
import { applyTransformers } from '#integration/transformers'
import { toArray } from '@unocss/core'
import { cyan, dim, green } from 'colorette'
import { consola } from 'consola'
import { basename, dirname, normalize, relative, resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { glob } from 'tinyglobby'
import { version } from '../package.json'
import { defaultConfig } from './config'
import { handleError, PrettyError } from './errors'
import { getWatcher } from './watcher'

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
  const files = await glob(options.patterns, { cwd, absolute: true, expandDirectories: false })
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

    const afterPreTrans = await transformFiles(sourceCache, 'pre')
    const afterDefaultTrans = await transformFiles(afterPreTrans)
    const afterPostTrans = await transformFiles(afterDefaultTrans, 'post')

    // update source file
    if (options.writeTransformed) {
      await Promise.all(
        afterPostTrans
          .filter(({ transformedCode }) => !!transformedCode)
          .map(async ({ transformedCode, id }) => {
            if (existsSync(id))
              await fs.writeFile(id, transformedCode as string, 'utf-8')
          }),
      )
    }

    const tokens = new Set<string>()

    for (const file of afterPostTrans) {
      const { matched } = await ctx.uno.generate(
        (file.transformedCode || file.code).replace(SKIP_COMMENT_RE, ''),
        {
          preflights: false,
          minify: true,
          id: file.id,
        },
      )
      matched.forEach(i => tokens.add(i))
    }

    const { css, matched } = await ctx.uno.generate(
      tokens,
      {
        preflights: options.preflights,
        minify: options.minify,
      },
    )

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
