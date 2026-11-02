import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { chmod, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createBenchmarkSummary } from './benchmark-summary.mjs'
import commentCoreBenchmark from './comment-core-benchmark.mjs'

const headSha = 'a'.repeat(40)
const baseSha = 'b'.repeat(40)
const marker = '<!-- unocss-bot:core-benchmark -->'

function report(median = 0.2, name = 'generate') {
  return {
    testResults: [{
      assertionResults: [{
        fullName: 'core',
        benchmarks: [{ tasks: [{ name, latency: { p50: median } }] }],
      }],
    }],
  }
}

async function fixture(t, { comments = [], related = [{ number: 42 }], latest } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'core-benchmark-comment-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const metadata = { number: 42, headSha, baseSha, repository: 'zyyv/unocss', runId: 17 }
  await writeFile(join(directory, 'pr.json'), JSON.stringify(metadata))
  await writeFile(join(directory, 'current.json'), JSON.stringify(report()))
  await writeFile(join(directory, 'base.json'), JSON.stringify(report(0.1)))

  const pr = {
    number: 42,
    state: 'open',
    head: { sha: headSha },
    base: { sha: baseSha, repo: { full_name: 'zyyv/unocss' } },
    merge_commit_sha: 'c'.repeat(40),
  }
  const writes = []
  let reads = 0
  const github = {
    rest: {
      pulls: { get: async () => ({ data: ++reads > 1 && latest ? latest : pr }) },
      issues: {
        listComments: () => {},
        createComment: async value => writes.push({ method: 'create', ...value }),
        updateComment: async value => writes.push({ method: 'update', ...value }),
      },
    },
    paginate: async () => comments,
  }
  const context = {
    repo: { owner: 'zyyv', repo: 'unocss' },
    payload: {
      workflow_run: {
        id: 17,
        event: 'pull_request',
        conclusion: 'success',
        path: '.github/workflows/benchmark.yml',
        head_sha: headSha,
        pull_requests: related,
      },
    },
  }
  const options = { github, context, core: { info: () => {} }, directory, botLogin: 'unocss-bot[bot]' }
  return { options, writes, pr, metadata }
}

test('creates the same summary used by Actions for a fork run without PR associations', async (t) => {
  const { options, writes, metadata } = await fixture(t, { related: [] })
  await commentCoreBenchmark(options)
  assert.equal(writes.length, 1)
  assert.equal(writes[0].method, 'create')
  assert.equal(writes[0].issue_number, 42)
  assert.equal(writes[0].body, `${createBenchmarkSummary(report(), report(0.1), metadata).trimEnd()}\n\n${marker}\n<!-- unocss-bot:benchmark-run 17:1 -->`)
  assert.match(writes[0].body, /\+100\.0%/)
})

test('updates only a comment authored by the configured App', async (t) => {
  const { options, writes } = await fixture(t, {
    comments: [
      { id: 1, user: { login: 'contributor', type: 'User' }, body: marker },
      { id: 2, user: { login: 'another-app[bot]', type: 'Bot' }, body: marker },
      { id: 3, user: { login: 'unocss-bot[bot]', type: 'Bot' }, body: marker },
    ],
  })
  await commentCoreBenchmark(options)
  assert.equal(writes[0].method, 'update')
  assert.equal(writes[0].comment_id, 3)
})

test('rejects an artifact that claims another PR', async (t) => {
  const { options, writes } = await fixture(t, { related: [{ number: 99 }] })
  await assert.rejects(commentCoreBenchmark(options), /another PR/)
  assert.equal(writes.length, 0)
})

test('rejects an unrelated commit even when the artifact metadata matches the PR', async (t) => {
  const { options, writes } = await fixture(t, { related: [] })
  options.context.payload.workflow_run.head_sha = 'd'.repeat(40)
  await assert.rejects(commentCoreBenchmark(options), /does not match/)
  assert.equal(writes.length, 0)
})

test('skips results from an outdated head or base commit and closed PRs', async (t) => {
  for (const change of [{ head: { sha: 'd'.repeat(40) } }, { base: { sha: 'd'.repeat(40), repo: { full_name: 'zyyv/unocss' } } }, { state: 'closed' }]) {
    const { options, pr, writes } = await fixture(t)
    Object.assign(pr, change)
    await commentCoreBenchmark(options)
    assert.equal(writes.length, 0)
  }
})

test('rechecks the PR before writing a comment', async (t) => {
  const { options, writes } = await fixture(t, { latest: { state: 'closed' } })
  await commentCoreBenchmark(options)
  assert.equal(writes.length, 0)
})

test('rejects a successful PR report without its exact baseline', async (t) => {
  const { options, writes } = await fixture(t)
  await rm(join(options.directory, 'base.json'))
  await assert.rejects(commentCoreBenchmark(options), /ENOENT/)
  assert.equal(writes.length, 0)
})

test('rejects symlinks in report artifacts', async (t) => {
  const { options, writes } = await fixture(t)
  await rm(join(options.directory, 'current.json'))
  await symlink(join(options.directory, 'base.json'), join(options.directory, 'current.json'))
  await assert.rejects(commentCoreBenchmark(options), /Invalid benchmark artifact file/)
  assert.equal(writes.length, 0)
})

test('escapes report names and rejects invalid or excessive measurements', () => {
  const summary = createBenchmarkSummary(report(0.1, '[link](url)|<img>@user\nnext'))
  assert.ok(!summary.includes('[link]'))
  assert.ok(!summary.includes('<img>'))
  assert.ok(!summary.includes('@user'))
  assert.ok(!summary.includes('|<img>'))
  assert.throws(() => createBenchmarkSummary(report(-1)), /Invalid benchmark task/)
  assert.throws(() => createBenchmarkSummary(report(Number.NaN)), /Invalid benchmark task/)
  assert.throws(() => createBenchmarkSummary({ testResults: [] }), /task count/)
  assert.match(createBenchmarkSummary(report(), report(0)), /No baseline/)
})

function repeated(values, name) {
  return { samples: values.map(value => report(value, name)) }
}

test('uses medians and highlights changes beyond the measured spread', () => {
  const summary = createBenchmarkSummary(repeated([0.12, 0.121, 0.119]), repeated([0.1, 0.101, 0.099]))
  assert.match(summary, /1 slower, 0 faster/)
  assert.match(summary, /Slower \+20\.0%/)
  assert.match(summary, /120\.00 µs/)
  assert.match(summary, /<details>/)
})

test('does not highlight differences inside observed noise or the 5% floor', () => {
  const noisy = createBenchmarkSummary(repeated([0.09, 0.12, 0.15]), repeated([0.1, 0.1, 0.1]))
  assert.match(noisy, /0 slower, 0 faster/)
  assert.match(noisy, /Within observed variation/)
  const small = createBenchmarkSummary(repeated([0.103, 0.103, 0.103]), repeated([0.1, 0.1, 0.1]))
  assert.match(small, /0 slower, 0 faster/)
  const boundary = createBenchmarkSummary(repeated([0.105, 0.105, 0.105]), repeated([0.1, 0.1, 0.1]))
  assert.match(boundary, /0 slower, 0 faster/)
})

test('highlights improvements and reports added and removed benchmarks', () => {
  const faster = createBenchmarkSummary(repeated([0.08, 0.08, 0.08]), repeated([0.1, 0.1, 0.1]))
  assert.match(faster, /0 slower, 1 faster/)
  const changed = createBenchmarkSummary(repeated([0.1, 0.1, 0.1], 'new'), repeated([0.1, 0.1, 0.1], 'old'))
  assert.match(changed, /New benchmark/)
  assert.match(changed, /Removed/)
})

test('rejects measurement rounds with missing tasks or duplicate names', () => {
  assert.throws(() => createBenchmarkSummary({ samples: [report(0.1, 'one'), report(0.1, 'two')] }), /missing from/)
  const duplicate = report()
  duplicate.testResults.push(...report().testResults)
  assert.throws(() => createBenchmarkSummary(duplicate), /Duplicate/)
})

test('failure replaces an old successful bot comment without reading partial reports', async (t) => {
  const { options, writes, metadata } = await fixture(t, {
    comments: [{ id: 3, user: { login: 'unocss-bot[bot]', type: 'Bot' }, body: marker }],
  })
  options.context.payload.workflow_run.conclusion = 'failure'
  metadata.failedStep = 'install_base'
  await writeFile(join(options.directory, 'pr.json'), JSON.stringify(metadata))
  await rm(join(options.directory, 'current.json'))
  await commentCoreBenchmark(options)
  assert.equal(writes[0].method, 'update')
  assert.match(writes[0].body, /Benchmark failed: Base dependency installation/)
  assert.match(writes[0].body, /actions\/runs\/17\/attempts\/1/)
})

test('timeout without an artifact uses only GitHub PR association metadata', async (t) => {
  const { options, writes } = await fixture(t, {
    related: [{ number: 42, head: { sha: headSha }, base: { sha: baseSha } }],
  })
  options.context.payload.workflow_run.conclusion = 'timed_out'
  await rm(join(options.directory, 'pr.json'))
  await commentCoreBenchmark(options)
  assert.match(writes[0].body, /Benchmark timed out/)
})

test('a failure without an artifact or PR association cannot target an arbitrary PR', async (t) => {
  const { options, writes } = await fixture(t, { related: [] })
  options.context.payload.workflow_run.conclusion = 'failure'
  await rm(join(options.directory, 'pr.json'))
  await commentCoreBenchmark(options)
  assert.equal(writes.length, 0)
})

test('old run results cannot overwrite a newer comment for the same commit', async (t) => {
  for (const previous of ['18:1', '17:2']) {
    const { options, writes } = await fixture(t, {
      comments: [{ id: 3, user: { login: 'unocss-bot[bot]', type: 'Bot' }, body: `${marker}\n<!-- unocss-bot:benchmark-run ${previous} -->` }],
    })
    await commentCoreBenchmark(options)
    assert.equal(writes.length, 0)
  }
})

test('rejects report metadata from another workflow attempt', async (t) => {
  const { options, writes } = await fixture(t)
  options.context.payload.workflow_run.run_attempt = 2
  await assert.rejects(commentCoreBenchmark(options), /Invalid benchmark PR metadata/)
  assert.equal(writes.length, 0)
})

test('CLI preserves the Actions step summary output and includes commit links', async (t) => {
  const { options } = await fixture(t)
  const output = join(options.directory, 'summary.md')
  const script = fileURLToPath(new URL('./benchmark-summary.mjs', import.meta.url))
  execFileSync(process.execPath, [script, join(options.directory, 'current.json'), join(options.directory, 'base.json'), join(options.directory, 'pr.json')], {
    env: { ...process.env, GITHUB_STEP_SUMMARY: output },
  })
  const summary = await readFile(output, 'utf8')
  assert.match(summary, /commit\/aaaaaaaa/)
  assert.match(summary, /<details>/)
})

test('runner measures both worktrees in alternating order and keeps three samples each', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'core-benchmark-runner-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  for (const folder of ['bin', 'base', 'current', 'reports'])
    await mkdir(join(root, folder))
  const executable = join(root, 'bin/pnpm')
  await writeFile(executable, `#!/usr/bin/env node
const { writeFileSync, appendFileSync } = require('node:fs')
const { basename } = require('node:path')
const output = process.argv[process.argv.indexOf('--outputFile') + 1]
appendFileSync(process.env.ORDER_LOG, basename(process.cwd()) + '\\n')
writeFileSync(output, JSON.stringify(${JSON.stringify(report())}))
`)
  await chmod(executable, 0o755)
  const runner = fileURLToPath(new URL('./run-core-benchmarks.mjs', import.meta.url))
  execFileSync(process.execPath, [runner], {
    cwd: root,
    env: {
      ...process.env,
      PATH: `${join(root, 'bin')}:${process.env.PATH}`,
      ORDER_LOG: join(root, 'order'),
      BENCHMARK_BASE_DIR: join(root, 'base'),
      BENCHMARK_REPORT_DIR: join(root, 'reports'),
    },
    stdio: 'pipe',
  })
  assert.equal(await readFile(join(root, 'order'), 'utf8'), 'base\ncurrent\ncurrent\nbase\nbase\ncurrent\n')
  for (const side of ['base', 'current'])
    assert.equal(JSON.parse(await readFile(join(root, 'reports', `${side}.json`), 'utf8')).samples.length, 3)
})
