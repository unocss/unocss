import type { ResolvedConfig, SourceCodeTransformerEnforce, UserConfig } from '@unocss/core'
import type { CliOptions, FileEntryItem, ResolvedCliOptions } from './types'
import { existsSync, promises as fs } from 'node:fs'
import process from 'node:process'
import { SKIP_COMMENT_RE } from '#integration/constants'
import { createContext } from '#integration/context'
import { applyTransformers } from '#integration/transformers'
import { hash } from '#integration/utils'
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

async function resolveOptions(options: CliOptions, userConfig: ResolvedConfig): Promise<ResolvedCliOptions> {
  const resolvedOptions = {
    ...options,
    entries: [],
    debug: options.debug || false,
  } as unknown as ResolvedCliOptions

  if (options.patterns?.length) {
    resolvedOptions.entries.push({
      patterns: options.patterns,
      outFile: options.outFile ?? resolve(options.cwd!, 'uno.css'),
      rewrite: (options.rewrite || options.writeTransformed) ?? false,
      splitCss: options.splitCss ?? true,
    })
  }

  // Add entries from uno.config cli option
  const configEntries = toArray(userConfig.cli?.entry || []).map(entry => ({
    ...entry,
    rewrite: entry.rewrite !== undefined ? entry.rewrite : (options.rewrite || options.writeTransformed) ?? false,
    splitCss: entry.splitCss !== undefined ? entry.splitCss : options.splitCss ?? true,
  }))
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

async function initializeConfig(options: CliOptions) {
  const { cwd = process.cwd(), config: configPath, preset } = options
  const ctx = createContext<UserConfig>(configPath)
  const configSources = (await ctx.updateRoot(cwd)).sources.map(normalize)

  if (!configSources.length) {
    const defaultPresets: Record<string, Promise<any>> = {
      wind3: import('@unocss/preset-wind3').then(m => m.default),
      wind4: import('@unocss/preset-wind4').then(m => m.default),
    }

    if (preset && preset in defaultPresets) {
      await ctx.uno.setConfig({
        presets: [
          await defaultPresets[preset],
        ],
        transformers: [
          (await import('@unocss/transformer-directives').then(m => m.default))(),
        ],
      })
    }
  }

  return { ctx, config: ctx.uno.config }
}

async function parseEntries(options: ResolvedCliOptions, cache: Map<string, FileEntryItem[]>) {
  cache.clear()

  for (const entry of options.entries) {
    const { outFile, rewrite } = entry
    const files = await glob(entry.patterns, { cwd: options.cwd, absolute: true, expandDirectories: false })
    const cssFiles = files.filter(f => f.endsWith('.css')).filter(f => f !== resolve(options.cwd, outFile))
    const otherFiles = files.filter(f => !f.endsWith('.css'))
    const singleKey = outFile.replace(/(\.css)?$/, '-merged.css')

    const addToCache = (file: string, code: string, key: string) => {
      const existing = cache.get(key) || []
      existing.push({ id: file, code, rewrite })
      cache.set(key, existing)
    }

    for (const file of otherFiles) {
      const code = await fs.readFile(file, 'utf-8')
      addToCache(file, code, outFile)
    }

    for (const file of cssFiles) {
      const code = await fs.readFile(file, 'utf-8')

      if (entry.splitCss === true) {
        addToCache(file, code, outFile)
      }
      else if (entry.splitCss === 'single') {
        addToCache(file, code, singleKey)
      }
      else if (entry.splitCss === 'multi') {
        const fileHash = hash(file)
        const currentOutFile = file.replace(/(\.css)?$/, `-${fileHash}.css`)
        addToCache(file, code, files.length > 1 ? currentOutFile : outFile)
      }
      // false: discard CSS files
    }
  }
}

export async function build(_options: CliOptions) {
  _options.cwd ??= process.cwd()

  /**
   * Cache of files to process
   *
   * key: output file path
   *
   * value: array of source files with their code
   */
  const fileCache = new Map<string, FileEntryItem[]>()
  const configResult = await initializeConfig(_options)
  const options = await resolveOptions(_options, configResult.config)
  options.ctx = configResult.ctx

  if (options.stdout && options.outFile) {
    consola.fatal(`Cannot use --stdout and --out-file at the same time`)
    return
  }

  consola.log(green(`UnoCSS v${version}`))

  if (options.watch)
    consola.start(`UnoCSS in watch mode...`)
  else
    consola.start(`UnoCSS for production...`)

  await parseEntries(options, fileCache)

  if (fileCache.size === 0) {
    consola.warn('No files matched the provided patterns.')
    return
  }

  if (!options.watch) {
    return await generate(options)
  }

  const debouncedBuild = debounce(
    async () => {
      generate(options).catch(handleError)
    },
    100,
  )

  await startWatcher().catch(handleError)

  async function generate(options: ResolvedCliOptions) {
    return Promise.all(
      Array.from(fileCache.entries()).map(([outFile, entries]) =>
        generateSingle(options, outFile, entries),
      ),
    )
  }

  async function startWatcher() {
    if (!options.watch)
      return
    const { ctx } = options
    const watcher = await getWatcher(options)
    const watchedFiles = [
      ...(fileCache.values()).flatMap(files => files.map(f => f.id)),
      ...ctx.getConfigFileList(),
    ]

    watcher.add(watchedFiles)
    watcher.on('all', async (type, file) => {
      const absolutePath = resolve(options.cwd, file)
      if (type === 'addDir' || type === 'unlinkDir')
        return

      if (ctx.getConfigFileList().map(normalize).includes(absolutePath)) {
        await ctx.reloadConfig()
        const newOtions = await resolveOptions(_options, ctx.uno.config)
        Object.assign(options, newOtions)
        await parseEntries(options, fileCache)

        const configSources = ctx.getConfigFileList().map(normalize)
        if (configSources.length)
          watcher.add(configSources)

        if (type === 'change')
          consola.info(`${cyan(basename(file))} changed, setting new config`)
        consola.info(
          `Watching for changes in ${
            [
              ...options.entries.flatMap(i => i.patterns),
              ...configSources,
            ]
              .map(cyan)
              .join(', ')}`,
        )
      }
      else {
        if (type === 'change') {
          consola.log(`${green(type)} ${dim(file)}`)
          const content = await fs.readFile(absolutePath, 'utf8')
          const matchedEntry = fileCache.keys().find(outfile => outfile === absolutePath)
          if (matchedEntry)
            return

          for (const [, files] of fileCache.entries()) {
            const fileEntry = files.find(f => f.id === absolutePath)
            if (fileEntry) {
              fileEntry.code = content
            }
          }
        }
        else if (type === 'unlink') {
          consola.log(`${green(type)} ${dim(file)}`)
          for (const [, files] of fileCache.entries()) {
            const index = files.findIndex(f => f.id === absolutePath)
            if (index !== -1) {
              files.splice(index, 1)
            }
          }
        }
        else if (type === 'add') {
          consola.log(`${green(type)} ${dim(file)}`)
          await parseEntries(options, fileCache)
        }
      }

      debouncedBuild()
    })
  }
}

async function transformFiles(
  ctx: ReturnType<typeof createContext>,
  sources: FileEntryItem[],
) {
  const run = (
    sources: FileEntryItem[],
    enforce: SourceCodeTransformerEnforce,
  ) => Promise.all(
    sources.map(source => new Promise<FileEntryItem>((resolve) => {
      applyTransformers(ctx, source.transformedCode ?? source.code, source.id, enforce)
        .then((transformsRes) => {
          resolve({
            ...source,
            transformedCode: transformsRes?.code ?? source.transformedCode,
          })
        })
    })),
  )

  const preTrans = await run(sources, 'pre')
  const defaultTrans = await run(preTrans, 'default')
  const postTrans = await run(defaultTrans, 'post')

  return postTrans
}

async function generateSingle(options: ResolvedCliOptions, outFile: string, files: FileEntryItem[]) {
  const start = performance.now()
  const { ctx } = options
  const transformedFiles = await transformFiles(ctx, files)
  const tokens = new Set<string>()
  const rewriter = []
  const css = []
  let matchedLen = 0

  for (const file of transformedFiles) {
    const input = (file.transformedCode || file.code).replace(SKIP_COMMENT_RE, '')
    if (!input)
      continue

    if (file.id.endsWith('.css')) {
      css.push(
        (process.env.CI || process.env.VITEST)
          ? input
          : `/* Source: ${file.id} */\n${input}`.trim(),
      )
    }
    else {
      (await ctx.uno.generate(
        input,
        {
          preflights: false,
          minify: true,
          id: file.id,
        },
      )).matched.forEach(i => tokens.add(i))
    }

    if (file.rewrite && file.transformedCode) {
      rewriter.push(fs.writeFile(file.id, file.transformedCode!, 'utf-8'))
    }
  }

  await Promise.all(rewriter)

  if (tokens.size > 0) {
    const result = await ctx.uno.generate(
      tokens,
      {
        preflights: options.preflights,
        minify: options.minify,
      },
    )

    css.push(result.css)
    matchedLen = result.matched.size
  }

  const finalCss = css.join('\n')

  if (options.stdout) {
    process.stdout.write(finalCss)
    return
  }

  if (options.debug) {
    debugDetailsTable(options, outFile, files)
  }

  const outFileResolved = resolve(options.cwd, outFile)
  const dir = dirname(outFileResolved)
  if (!existsSync(dir))
    await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(outFileResolved, finalCss, 'utf-8')

  if (!options.watch) {
    const duration = (performance.now() - start).toFixed(2)

    if (rewriter.length > 0) {
      consola.success(
        `${rewriter.length} file${rewriter.length > 1 ? 's' : ''} rewritten in ${green(duration)}ms`,
      )
    }
    if (matchedLen > 0) {
      consola.success(
        `${matchedLen} utilities generated to ${cyan(
          relative(process.cwd(), outFileResolved),
        )} in ${green(duration)}ms\n`,
      )
    }
  }
}
