import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const [currentPath, basePath] = process.argv.slice(2)

if (!currentPath)
  throw new Error('Usage: benchmark-summary.mjs <current-result> [base-result]')

function collectBenchmarks(result) {
  return new Map(result.files.flatMap(file => file.groups.flatMap(group => group.benchmarks.map(benchmark => [
    `${group.fullName} > ${benchmark.name}`,
    benchmark.median,
  ]))))
}

function formatMilliseconds(milliseconds) {
  if (milliseconds < 1)
    return `${(milliseconds * 1_000).toFixed(2)} µs`
  return `${milliseconds.toFixed(2)} ms`
}

function formatDelta(current, base) {
  if (base == null)
    return 'No baseline'

  const delta = ((current - base) / base) * 100
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
}

const current = collectBenchmarks(JSON.parse(await readFile(currentPath, 'utf8')))
const base = basePath ? collectBenchmarks(JSON.parse(await readFile(basePath, 'utf8'))) : undefined
const rows = [...current]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, median]) => `| ${name} | ${formatMilliseconds(median)} | ${formatDelta(median, base?.get(name))} |`)

const summary = [
  '## Core benchmark',
  '',
  base ? 'Compared with the pull request base commit.' : 'No baseline result is available for this commit.',
  '',
  '| Benchmark | Median | Change |',
  '| --- | ---: | ---: |',
  ...rows,
  '',
].join('\n')

if (process.env.GITHUB_STEP_SUMMARY)
  await writeFile(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' })
else
  process.stdout.write(summary)
