import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function collectBenchmarks(result) {
  const reports = result.samples ?? [result]
  if (!Array.isArray(reports) || reports.length === 0 || reports.length > 5)
    throw new Error('Unexpected measurement round count')
  const measurements = new Map()
  for (const report of reports) {
    const entries = report.testResults.flatMap(file => file.assertionResults.flatMap(test => test.benchmarks.flatMap(benchmark => benchmark.tasks.map((task) => {
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
    if (new Set(entries.map(([name]) => name)).size !== entries.length)
      throw new Error('Duplicate benchmark name')
    for (const [name, value] of entries) {
      const values = measurements.get(name) ?? []
      values.push(value)
      measurements.set(name, values)
    }
  }
  return new Map([...measurements].map(([name, values]) => {
    if (values.length !== reports.length)
      throw new Error('Benchmark missing from a measurement round')
    const value = median(values)
    const range = Math.max(...values) - Math.min(...values)
    const spread = value > 0 ? range / value * 100 : range > 0 ? Number.POSITIVE_INFINITY : 0
    return [name, { median: value, spread, rounds: values.length }]
  }))
}

function escapeTableCell(value) {
  return value.replace(/[\r\n]/g, ' ').replace(/[\\`*_[\]<>|@&]/g, character => `&#${character.charCodeAt(0)};`)
}

function formatMilliseconds(milliseconds) {
  if (milliseconds == null)
    return '—'
  if (milliseconds < 1)
    return `${(milliseconds * 1_000).toFixed(2)} µs`
  return `${milliseconds.toFixed(2)} ms`
}

export function formatBenchmarkContext({ repository, headSha, baseSha, runId, runAttempt = 1 } = {}) {
  if (!repository)
    return ''
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)
    || !/^[a-f\d]{40}$/i.test(headSha) || !/^[a-f\d]{40}$/i.test(baseSha)
    || !Number.isSafeInteger(runId) || runId < 1
    || !Number.isSafeInteger(runAttempt) || runAttempt < 1) {
    throw new Error('Invalid benchmark context')
  }
  const url = `https://github.com/${repository}`
  return `Base [${baseSha.slice(0, 7)}](${url}/commit/${baseSha}) → PR [${headSha.slice(0, 7)}](${url}/commit/${headSha}) · [Run logs](${url}/actions/runs/${runId}/attempts/${runAttempt})`
}

export function createBenchmarkSummary(currentResult, baseResult, context) {
  const current = collectBenchmarks(currentResult)
  const base = baseResult ? collectBenchmarks(baseResult) : new Map()
  const comparisons = [...new Set([...current.keys(), ...base.keys()])].map((name) => {
    const value = current.get(name)
    const baseline = base.get(name)
    const delta = value && baseline?.median > 0 ? (value.median - baseline.median) / baseline.median * 100 : undefined
    const repeated = value?.rounds >= 3 && baseline?.rounds >= 3
    const threshold = Math.max(5, value?.spread ?? 0, baseline?.spread ?? 0)
    let status
    if (!value)
      status = 'Removed'
    else if (!baseline)
      status = baseResult ? 'New benchmark' : 'No baseline'
    else if (delta == null)
      status = 'No baseline'
    else if (!repeated)
      status = 'Single measurement'
    else if (Math.abs(delta) <= threshold + 1e-9)
      status = 'Within observed variation'
    else
      status = delta > 0 ? 'Slower' : 'Faster'
    return { name, value, baseline, delta, status }
  })
  const formatDelta = delta => delta == null ? 'No baseline' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`
  const formatSpread = spread => Number.isFinite(spread) ? `${spread.toFixed(1)}%` : 'unbounded'
  const highlighted = comparisons.filter(row => row.status === 'Slower' || row.status === 'Faster')
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
  const rows = comparisons.sort((a, b) => a.name.localeCompare(b.name)).map(row => [
    escapeTableCell(row.name),
    formatMilliseconds(row.baseline?.median),
    formatMilliseconds(row.value?.median),
    formatDelta(row.delta),
    row.baseline && row.value ? `${formatSpread(row.baseline.spread)} / ${formatSpread(row.value.spread)}` : '—',
    row.status,
  ].join(' | '))
  const contextLine = formatBenchmarkContext(context)
  const summary = [
    '## Core benchmark',
    '',
    ...(contextLine ? [contextLine, ''] : []),
    baseResult ? 'Compared with the exact pull request base commit. Lower latency is better.' : 'No baseline result is available for this commit.',
    '',
    `**Outside observed variation:** ${highlighted.filter(row => row.status === 'Slower').length} slower, ${highlighted.filter(row => row.status === 'Faster').length} faster.`,
    ...highlighted.slice(0, 5).map(row => `- **${row.status} ${formatDelta(row.delta)}:** ${escapeTableCell(row.name)}`),
    '',
    'Medians are calculated across measurement rounds. Changes are highlighted only with at least 3 rounds per commit and when they exceed both 5% and each commit’s observed spread (range ÷ median). This is a noise heuristic, not a statistical significance test or a CI failure threshold.',
    '',
    '<details>',
    `<summary>All ${rows.length} benchmark results</summary>`,
    '',
    '| Benchmark | Base median | PR median | Change | Spread: base / PR | Status |',
    '| --- | ---: | ---: | ---: | ---: | --- |',
    ...rows.map(row => `| ${row} |`),
    '',
    '</details>',
    '',
  ].join('\n')
  if (summary.length > 60000)
    throw new Error('Benchmark summary exceeds the comment size limit')
  return summary
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [currentPath, basePath, metadataPath] = process.argv.slice(2)
  if (!currentPath)
    throw new Error('Usage: benchmark-summary.mjs <current-result> [base-result] [metadata]')
  const summary = createBenchmarkSummary(
    JSON.parse(await readFile(currentPath, 'utf8')),
    basePath ? JSON.parse(await readFile(basePath, 'utf8')) : undefined,
    metadataPath ? JSON.parse(await readFile(metadataPath, 'utf8')) : undefined,
  )
  if (process.env.GITHUB_STEP_SUMMARY)
    await writeFile(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' })
  else
    process.stdout.write(summary)
}
