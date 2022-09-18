import { existsSync, promises as fs } from 'fs'
import { basename, dirname, relative, resolve } from 'pathe'
import fg from 'fast-glob'
import consola from 'consola'
import { cyan, dim, green } from 'colorette'
import { debounce } from 'perfect-debounce'
import { createGenerator, toArray } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { version } from '../package.json'
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
  const { config, sources: configSources } = await loadConfig(cwd, options.config)

  const uno = createGenerator(
    config,
    defaultConfig,
  )

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
        uno.setConfig((await loadConfig()).config)
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

  startWatcher().catch(handleError)

  async function generate(options: ResolvedCliOptions) {
    const outFile = resolve(options.cwd || process.cwd(), options.outFile ?? 'uno.css')
    const { css, matched } = await uno.generate(
      [...fileCache].join('\n'),
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
