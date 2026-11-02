import { lstat, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { createBenchmarkSummary } from './benchmark-summary.mjs'

const marker = '<!-- unocss-bot:core-benchmark -->'

async function readReport(directory, name, optional = false) {
  const path = join(directory, name)
  let stat
  try {
    stat = await lstat(path)
  }
  catch (error) {
    if (optional && error.code === 'ENOENT')
      return undefined
    throw error
  }
  if (!stat.isFile() || stat.size > 4 * 1024 * 1024)
    throw new Error(`Invalid benchmark artifact file: ${name}`)
  return JSON.parse(await readFile(path, 'utf8'))
}

export default async function commentCoreBenchmark({ github, context, core, directory = process.env.BENCHMARK_REPORT_DIR, botLogin = process.env.BENCHMARK_BOT_LOGIN }) {
  const run = context.payload.workflow_run
  if (run?.event !== 'pull_request' || run.conclusion !== 'success'
    || run.path !== '.github/workflows/benchmark.yml') {
    throw new Error('Unexpected benchmark workflow run')
  }
  if (!directory || !botLogin?.endsWith('[bot]'))
    throw new Error('Benchmark comment configuration is missing')

  // The artifact is untrusted data. Bind it to GitHub's run and current PR.
  const metadata = await readReport(directory, 'pr.json')
  const repository = `${context.repo.owner}/${context.repo.repo}`
  if (metadata.repository !== repository || metadata.runId !== run.id
    || !Number.isSafeInteger(metadata.number) || metadata.number < 1
    || !/^[a-f\d]{40}$/i.test(metadata.headSha) || !/^[a-f\d]{40}$/i.test(metadata.baseSha)) {
    throw new Error('Invalid benchmark PR metadata')
  }
  if (run.pull_requests?.length && !run.pull_requests.some(pr => pr.number === metadata.number))
    throw new Error('Benchmark run belongs to another PR')

  const params = { ...context.repo, pull_number: metadata.number }
  const { data: pr } = await github.rest.pulls.get(params)
  if (pr.base.repo.full_name !== repository)
    throw new Error('Benchmark PR belongs to another repository')
  if (pr.state !== 'open' || pr.head.sha !== metadata.headSha || pr.base.sha !== metadata.baseSha) {
    core.info('Skipping a closed PR or outdated benchmark result')
    return
  }
  // Some fork runs omit pull_requests. Verify the commit against GitHub's PR
  // response as well, rather than trusting the artifact's PR number alone.
  if (run.head_sha !== pr.head.sha && run.head_sha !== pr.merge_commit_sha)
    throw new Error('Benchmark run does not match the PR commit')

  const summary = createBenchmarkSummary(
    await readReport(directory, 'current.json'),
    await readReport(directory, 'base.json', true),
  )
  const comments = await github.paginate(github.rest.issues.listComments, {
    ...context.repo,
    issue_number: pr.number,
    per_page: 100,
  })
  const existing = comments.find(comment => comment.user?.login === botLogin
    && comment.user.type === 'Bot' && comment.body?.includes(marker))

  // A newer commit can arrive while the reports and comments are being read.
  const { data: latest } = await github.rest.pulls.get(params)
  if (latest.state !== 'open' || latest.head.sha !== metadata.headSha || latest.base.sha !== metadata.baseSha) {
    core.info('Skipping a benchmark superseded while preparing the comment')
    return
  }
  const body = `${summary.trimEnd()}\n\n${marker}`
  if (existing)
    await github.rest.issues.updateComment({ ...context.repo, comment_id: existing.id, body })
  else
    await github.rest.issues.createComment({ ...context.repo, issue_number: pr.number, body })
}
