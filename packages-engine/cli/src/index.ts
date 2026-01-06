import type { SourceCodeTransformerEnforce, UserConfig } from '@unocss/core'
import type { CliOptions, ResolvedCliOptions } from './types'
import { existsSync, promises as fs } from 'node:fs'
import process from 'node:process'
import { SKIP_COMMENT_RE } from '#integration/constants'
import { createContext } from '#integration/context'
import { applyTransformers } from '#integration/transformers'
import { toArray } from '@unocss/core'
import { cyan, dim, green, yellow } from 'colorette'
import { consola } from 'consola'
import { basename, dirname, normalize, relative, resolve } from 'pathe'
import { debounce } from 'perfect-debounce'
import { glob } from 'tinyglobby'
import { version } from '../package.json'
import { debugDetailsTable } from './debug'
import { handleError, PrettyError } from './errors'
import { getWatcher } from './watcher'

async function resolveOptions(options: CliOptions, configResult: ReturnType<typeof initializeConfig>): Promise<ResolvedCliOptions> {
  const resolvedOptions = {
    ...options,
    ...(await configResult),
    entries: [],
    debug: options.debug || true,
  } as unknown as ResolvedCliOptions

  if (options.patterns?.length) {
    resolvedOptions.entries.push({
      patterns: options.patterns,
      outFile: options.outFile ?? resolve(options.cwd!, 'uno.css'),
    })
  }

  // Add entries from config
  const configEntries = toArray(resolvedOptions.config.cli?.entry || [])
  resolvedOptions.entries.push(...configEntries)

  if (!resolvedOptions.entries.length) {
    throw new PrettyError(
      `No glob patterns provided. Try ${cyan('unocss <path/to/**/*>')} or configure entries in ${cyan('uno.config')} file. See ${cyan('https://unocss.dev/integrations/cli#configurations')}`,
    )
  }

  if (resolvedOptions.writeTransformed) {
    consola.warn(`--write-transformed is deprecated, please use ${yellow('--rewrite')} instead.`)
  }

  return resolvedOptions
}

async function initializeConfig(cwd: string, configPath?: string) {
  const ctx = createContext<UserConfig>(configPath)
  const configSources = (await ctx.updateRoot(cwd)).sources.map(normalize)
  const config = await ctx.getConfig()

  return { ctx, configSources, config }
}

export async function build(_options: CliOptions) {
  _options.cwd ??= process.cwd()

  /**
   * Cache of files to process
   *
   * key: output file path
   * value: array of source files with their code
   */
  const fileCache = new Map<string, { path: string, code: string }[]>()
  const options = await resolveOptions(_options, initializeConfig(_options.cwd, _options.config))

  if (options.stdout && options.outFile) {
    consola.fatal(`Cannot use --stdout and --out-file at the same time`)
    return
  }

  for (const entry of options.entries) {
    const files = await glob(entry.patterns, { cwd: options.cwd, absolute: true, expandDirectories: false })
    const isAllCSS = files.every(f => f.endsWith('.css'))

    for (const file of files) {
      const outFile = entry.outFile
      if (file === resolve(options.cwd, outFile))
        continue

      const code = await fs.readFile(file, 'utf8')
      if (!isAllCSS && file.endsWith('.css')) {
        const fileWithUno = file.replace(/\.css$/, '-uno.css')
        fileCache.set(fileWithUno, [{ path: file, code }])
      }
      else {
        const existing = fileCache.get(outFile) || []
        existing.push({ path: file, code })
        fileCache.set(outFile, existing)
      }
    }
  }

  consola.log(green(`unocss v${version}`))

  if (options.watch)
    consola.start(`unocss in watch mode...`)
  else
    consola.start(`unocss for production...`)

  const debouncedBuild = debounce(
    async () => {
      generate(options).catch(handleError)
    },
    100,
  )

  const startWatcher = async () => {
    if (!options.watch)
      return
    const { patterns, configSources, ctx } = options

    const watcher = await getWatcher(options)

    if (configSources.length)
      watcher.add(configSources)

    watcher.on('all', async (type, file) => {
      const absolutePath = resolve(options.cwd, file)
      if (type === 'addDir' || type === 'unlinkDir')
        return

      if (configSources.includes(absolutePath)) {
        await ctx.reloadConfig()
        if (configSources.length)
          watcher.add(configSources)
        consola.info(`${cyan(basename(file))} changed, setting new config`)
      }
      else {
        consola.log(`${green(type)} ${dim(file)}`)

        const content = type.startsWith('unlink') ? '' : await fs.readFile(absolutePath, 'utf8')

        for (const [outFile, files] of fileCache.entries()) {
          if (type.startsWith('unlink')) {
            const newFiles = files.filter(f => f.path !== absolutePath)
            if (newFiles.length !== files.length)
              fileCache.set(outFile, newFiles)
            if (outFile === absolutePath)
              fileCache.delete(outFile)
          }
          else {
            const fileEntry = files.find(f => f.path === absolutePath)
            if (fileEntry)
              fileEntry.code = content
            if (outFile === absolutePath)
              fileCache.set(outFile, [{ path: absolutePath, code: content }])
          }
        }

        if (type === 'add' || type === 'unlink') {
          fileCache.clear()
          for (const entry of options.entries) {
            const files = await glob(entry.patterns, { cwd: options.cwd, absolute: true, expandDirectories: false })
            const isAllCSS = files.every(f => f.endsWith('.css'))

            for (const file of files) {
              const code = await fs.readFile(file, 'utf8')
              if (!isAllCSS && file.endsWith('.css')) {
                const fileWithUno = file.replace(/\.css$/, '-uno.css')
                fileCache.set(fileWithUno, [{ path: file, code }])
              }
              else {
                const outFile = entry.outFile
                const existing = fileCache.get(outFile) || []
                existing.push({ path: file, code })
                fileCache.set(outFile, existing)
              }
            }
          }
        }
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

  function generate(options: ResolvedCliOptions) {
    return Promise.all(
      Array.from(fileCache.entries()).map(([outFile, files]) =>
        generateSingle(options, outFile, files),
      ),
    )
  }
}

async function transformFiles(
  ctx: ReturnType<typeof createContext>,
  sources: { id: string, code: string, transformedCode?: string | undefined }[],
) {
  const run = (
    sources: { id: string, code: string, transformedCode?: string | undefined }[],
    enforce: SourceCodeTransformerEnforce,
  ) => Promise.all(
    sources.map(({ id, code, transformedCode }) => new Promise<{ id: string, code: string, transformedCode: string | undefined }>((resolve) => {
      applyTransformers(ctx, code, id, enforce)
        .then((transformsRes) => {
          resolve({ id, code, transformedCode: transformsRes?.code || transformedCode })
        })
    })),
  )

  const preTrans = await run(sources, 'pre')
  const defaultTrans = await run(preTrans, 'default')
  const postTrans = await run(defaultTrans, 'post')

  return postTrans
}

async function generateSingle(options: ResolvedCliOptions, outFile: string, files: { path: string, code: string }[]) {
  const start = performance.now()
  const isCSSFiles = files.every(f => f.path.endsWith('.css'))
  const { ctx } = options
  const sourceCache = files.map(f => ({ id: f.path, code: f.code }))
  const transformedFiles = await transformFiles(ctx, sourceCache)
  // const realTransformedFiles = transformedFiles.filter(f => f.transformedCode) // actually transformed

  let css, matched

  if (isCSSFiles) {
    css = transformedFiles
      .map((f) => {
        const code = (f.transformedCode || f.code).replace(SKIP_COMMENT_RE, '')
        if (!code)
          return undefined
        return (process.env.CI || process.env.VITEST)
          ? code
          : `/* Source: ${f.id} */\n${code}`
      })
      .filter(Boolean)
      .join('\n')
  }
  else {
    const tokens = new Set<string>()

    for (const file of transformedFiles) {
      const input = (file.transformedCode || file.code).replace(SKIP_COMMENT_RE, '')
      if (!input)
        continue

      const { matched } = await ctx.uno.generate(
        input,
        {
          preflights: false,
          minify: true,
          id: file.id,
        },
      )
      matched.forEach(i => tokens.add(i))
    }

    const result = await ctx.uno.generate(
      tokens,
      {
        preflights: options.preflights,
        minify: options.minify,
      },
    )

    css = result.css
    matched = result.matched
  }

  if (options.stdout) {
    process.stdout.write(css)
    return
  }

  const outFileResolved = resolve(options.cwd, outFile)
  const dir = dirname(outFileResolved)
  if (!existsSync(dir))
    await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(outFileResolved, css, 'utf-8')

  // update source file
  if (options.rewrite || options.writeTransformed) {
    await Promise.all(
      transformedFiles
        .filter(({ transformedCode }) => !!transformedCode)
        .map(async ({ transformedCode, id }) => {
          if (existsSync(id))
            await fs.writeFile(id, transformedCode as string, 'utf-8')
        }),
    )
  }

  if (!options.watch) {
    if (options.debug) {
      debugDetailsTable(options, outFile, files)
    }

    const duration = (performance.now() - start).toFixed(2)
    if (isCSSFiles) {
      consola.success(
        `Transformed CSS generated to ${cyan(
          relative(process.cwd(), outFileResolved),
        )} in ${duration}ms\n`,
      )
    }
    else {
      consola.success(
        `${[...matched!].length} utilities generated to ${cyan(
          relative(process.cwd(), outFileResolved),
        )} in ${duration}ms\n`,
      )
    }
  }
}
