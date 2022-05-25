import { cac } from 'cac'
import { version } from '../package.json'
import { handleError } from './errors'
import type { CliOptions } from './types'
import { build } from './index'

const name = 'unocss'

async function main(options: CliOptions = {}) {
  const cli = cac(name)

  cli
    .command('[...patterns]', 'Glob patterns', {
      ignoreOptionDefaultValue: true,
    })
    .option('-o, --out-file <file>', 'Output file', {
      default: process.cwd(),
    })
    .option('-c, --config [file]', 'Config file')
    .option('-w, --watch', 'Watch for file changes')
    .action(async (patterns: Array<string>, flags) => {
      Object.assign(options, {
        ...flags,
      })

      if (patterns)
        options.patterns = patterns

      await build(options)
    })

  cli.help()

  cli.version(version)

  // Parse CLI args without running the command to
  // handle command errors globally
  cli.parse(process.argv, { run: false })
  await cli.runMatchedCommand()
}

main().catch(handleError)
