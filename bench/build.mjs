/* eslint-disable no-console */
import { join } from 'path'
import fs from 'fs-extra'
import { build } from 'vite'
import { dir, targets } from './meta.mjs'

const result = {}
const date = new Date().toISOString()

function BuildTimePlugin(name) {
  let start = 0

  return {
    name: 'time-log',
    apply: 'build',
    buildStart() {
      start = performance.now()
    },
    buildEnd() {
      result[name].time = performance.now() - start
    },
  }
}

console.log('warming up...')
for (let i = 0; i < 10; i++)
  await run('none')

targets.sort(() => Math.random() - 0.5)

for (let i = 0; i < targets.length; i++) {
  const name = targets[i]
  console.log(`- ${name}`)
  result[name] = { index: i, name, date }
  await run(name, true)
}

async function run(target, bench = false) {
  const cwd = join(dir, 'fixtures', target)
  process.chdir(cwd)
  await build({
    root: cwd,
    logLevel: 'silent',
    build: {
      minify: false,
    },
    plugins: bench
      ? [BuildTimePlugin(target)]
      : [],
  })
}

const full = await fs.readJSON(`${dir}/result.json`) || []

full.push(...Object.values(result))

await fs.writeJSON(`${dir}/result.json`, full, { spaces: 2 })
