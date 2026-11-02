import assert from 'node:assert/strict'
import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
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
  const { options, writes } = await fixture(t, { related: [] })
  await commentCoreBenchmark(options)
  assert.equal(writes.length, 1)
  assert.equal(writes[0].method, 'create')
  assert.equal(writes[0].issue_number, 42)
  assert.equal(writes[0].body, `${createBenchmarkSummary(report(), report(0.1)).trimEnd()}\n\n${marker}`)
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

test('supports missing baseline artifacts', async (t) => {
  const { options, writes } = await fixture(t)
  await rm(join(options.directory, 'base.json'))
  await commentCoreBenchmark(options)
  assert.match(writes[0].body, /No baseline result/)
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
