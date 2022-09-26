import { cac } from 'cac'
import { loadConfig } from '@unocss/config'
import { version } from '../package.json'
import type { CliOptions } from './types'
import { build } from './index'

export async function startCli(cwd = process.cwd(), argv = process.argv, options: CliOptions = {}) {
  const cli = cac('unocss')

  cli
    .command('[...patterns]', 'Glob patterns', {
      ignoreOptionDefaultValue: true,
    })
    .option('-o, --out-file <file>', 'Output file', {
      default: cwd,
    })
    .option('-c, --config [file]', 'Config file')
    .option('-w, --watch', 'Watch for file changes')
    .option('--preflights', 'Enable preflights', { default: true })
    .option('-m, --minify', 'Minify generated CSS', { default: false })
    .action(async (patterns: Array<string>, flags) => {
      Object.assign(options, {
        cwd,
        ...flags,
      })

      if (patterns)
        options.patterns = patterns
      const { config } = await loadConfig(cwd, options.config)
      if (config?.cli && Array.isArray(config.cli.entry) && config.cli.entry.length !== 0) {
        const len = config.cli.entry.length
        const cliEntryItems = config.cli.entry
        for (let i = 0; i < len; i++) {
          options.patterns = cliEntryItems[i].patterns
          options.outFile = cliEntryItems[i].outFile
          await build(options)
        }
      }
      else if (config?.cli && !Array.isArray(config.cli.entry) && typeof config.cli.entry === 'object' && Object.keys(config.cli.entry).length !== 0) {
        options.patterns = config.cli.entry?.patterns
        options.outFile = config.cli.entry?.outFile
        await build(options)
      }
      else {
        await build(options)
      }
    })

  cli.help()
  cli.version(version)

  // Parse CLI args without running the command to
  // handle command errors globally
  cli.parse(argv, { run: false })
  await cli.runMatchedCommand()
}
