/* eslint-disable no-console */
import { join } from 'path'
import fs from 'fs-extra'
import { build } from 'vite'
import CreateVue from '@vitejs/plugin-vue'
import { targets, dir } from './meta.mjs'

const result = {}
const date = new Date().toISOString()

const VuePlugin = CreateVue()

function BuildTimePlugin(name) {
  let start = 0

  return {
    name: 'time-log',
    apply: 'build',
    buildStart() {
      start = performance.now()
      console.time(`build:${name}`)
    },
    buildEnd() {
      console.timeEnd(`build:${name}`)
      result[name].time = performance.now() - start
    },
    async closeBundle() {
      const dist = join(dir, 'fixtures', name, 'dist/assets')
      const files = await fs.readdir(dist)
      let size = 0
      for (const file of files) {
        if (file.endsWith('.css')) {
          const stat = await fs.lstat(join(dist, file))
          size += stat.size
        }
      }
      result[name].size = size
    },
  }
}

console.log('warning up vite...')
for (let i = 0; i < 10; i++)
  await run('none')

console.log('\n\nstart')

targets.sort(() => Math.random() - 0.5)

for (let i = 0; i < targets.length; i++) {
  const name = targets[i]
  result[name] = { index: i, name, date }
  await run(name, true)
}

async function run(target, bench = false) {
  const cwd = join(dir, 'fixtures', target)
  process.chdir(cwd)
  await build({
    root: cwd,
    logLevel: 'silent',
    plugins: bench
      ? [
        VuePlugin,
        BuildTimePlugin(target)]
      : [
        VuePlugin,
      ],
  })
}

console.log(Object.values(result))

const full = await fs.readJSON(`${dir}/result.json`) || []

full.push(...Object.values(result))

await fs.writeJSON(`${dir}/result.json`, full, { spaces: 2 })
