import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

function collectBenchmarks(result) {
  const entries = result.testResults.flatMap(file => file.assertionResults.flatMap(test => test.benchmarks.flatMap(benchmark => benchmark.tasks.map((task) => {
    if (typeof test.fullName !== 'string' || typeof task.name !== 'string'
      || !Number.isFinite(task.latency?.p50) || task.latency.p50 < 0) {
      throw new Error('Invalid benchmark task')
    }

    const name = `${test.fullName} > ${task.name}`
    if (name.length > 1000)
      throw new Error('Benchmark name is too long')
    return [name, task.latency.p50]
  }))))
  if (entries.length === 0 || entries.length > 500)
    throw new Error('Unexpected benchmark task count')
  return new Map(entries)
}

function escapeTableCell(value) {
  return value.replace(/[\r\n]/g, ' ').replace(/[\\`*_[\]<>|@]/g, character => `&#${character.charCodeAt(0)};`)
}

function formatMilliseconds(milliseconds) {
  if (milliseconds < 1)
    return `${(milliseconds * 1_000).toFixed(2)} µs`
  return `${milliseconds.toFixed(2)} ms`
}

function formatDelta(current, base) {
  if (base == null || base <= 0)
    return 'No baseline'

  const delta = ((current - base) / base) * 100
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
}

export function createBenchmarkSummary(currentResult, baseResult) {
  const current = collectBenchmarks(currentResult)
  const base = baseResult ? collectBenchmarks(baseResult) : undefined
  const rows = [...current]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, median]) => `| ${escapeTableCell(name)} | ${formatMilliseconds(median)} | ${formatDelta(median, base?.get(name))} |`)

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
  if (summary.length > 60000)
    throw new Error('Benchmark summary exceeds the comment size limit')
  return summary
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [currentPath, basePath] = process.argv.slice(2)
  if (!currentPath)
    throw new Error('Usage: benchmark-summary.mjs <current-result> [base-result]')

  const summary = createBenchmarkSummary(
    JSON.parse(await readFile(currentPath, 'utf8')),
    basePath ? JSON.parse(await readFile(basePath, 'utf8')) : undefined,
  )
  if (process.env.GITHUB_STEP_SUMMARY)
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' })
  else
    process.stdout.write(summary)
}
