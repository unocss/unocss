import { readFile, writeFile } from 'fs/promises'
import { relative, resolve, basename } from 'pathe'
import fg from 'fast-glob'
import consola from 'consola'
import { cyan, dim, green, white } from 'colorette'
import { createGenerator } from '@unocss/core'
import type { UnoGenerator } from '@unocss/core'
import { loadConfig } from '@unocss/config'
import { version } from '../package.json'
import { handleError, PrettyError } from './errors'
import { debouncePromise } from './utils'
import { defaultConfig } from './config'
import type { CliOptions, ResolvedCliOptions } from './types'

const name = 'unocss'
let uno: UnoGenerator

const fileCache = new Map<string, string>()

export async function generate(options: ResolvedCliOptions) {
  const outFile = options.outFile ?? resolve(process.cwd(), 'uno.css')
  const { css, matched } = await uno.generate([...fileCache].join('\n'))

  await writeFile(outFile, css, 'utf-8')

  if (!options.watch) {
    consola.success(
      `${[...matched].length} utilities generated to ${cyan(
        relative(process.cwd(), outFile),
      )}\n`,
    )
  }
}

export async function resolveOptions(options: CliOptions) {
  if (!options.patterns?.length) {
    throw new PrettyError(
      `No glob patterns, try ${cyan(`${name} <path/to/**/*>`)}`,
    )
  }

  return options as ResolvedCliOptions
}

export async function build(_options: CliOptions) {
  const options = await resolveOptions(_options)
  const { filepath, config } = loadConfig()

  uno = createGenerator(
    config,
    defaultConfig,
  )

  const files = await fg(options.patterns)
  await Promise.all(
    files.map(async(file) => {
      fileCache.set(file, await readFile(file, 'utf8'))
    }),
  )

  consola.log(green(`${name} v${version}`))
  consola.start(`UnoCSS ${options.watch ? 'in watch mode...' : 'for production...'}`)

  const debouncedBuild = debouncePromise(
    async() => {
      generate(options)
    },
    100,
    handleError,
  )

  const startWatcher = async() => {
    if (!options.watch) return

    const { watch } = await import('chokidar')
    const { patterns } = options
    const ignored = ['**/{.git,node_modules}/**']

    consola.info(
      `Watching for changes in ${
        cyan(Array.isArray(patterns) ? patterns.join(white(', ')) : patterns)}`,
    )

    const watcher = watch(patterns, {
      ignoreInitial: true,
      ignorePermissionErrors: true,
      ignored,
    })

    if (filepath) watcher.add(filepath)

    watcher.on('all', async(type, file) => {
      if (file === filepath) {
        uno.setConfig(loadConfig(filepath).config)
        consola.info(`${cyan(basename(file))} changed, setting new config`)
      }
      else {
        consola.log(`${green(`${type}`)} ${white(dim(file))}`)

        if (type.startsWith('unlink'))
          fileCache.delete(file)
        else
          fileCache.set(file, await readFile(file, 'utf8'))
      }

      debouncedBuild()
    })
  }

  await generate(options)

  startWatcher()
}
