/* eslint-disable no-console */
import { join } from 'path'
import { promises as fs } from 'fs'
import { build } from 'vite'
import { targets, dir } from './meta.mjs'

const data = {}

function BuildTimePlugin(name) {
  let start = 0

  return {
    name: 'time-log',
    apply: 'build',
    buildStart() {
      start = Date.now()
      console.time(`build:${name}`)
    },
    buildEnd() {
      console.timeEnd(`build:${name}`)
      data[name] = {
        time: Date.now() - start,
      }
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
      data[name].size = size
    },
  }
}

for (let i = 0; i < 10; i++) {
  console.log(`warning up... x${i + 1}`)
  await run('none')
}

console.log('\n\n')

for (const target of targets)
  await run(target, true)

async function run(target, bench = false) {
  if (bench)
    console.log('\n----\n')
  const cwd = join(dir, 'fixtures', target)
  process.chdir(cwd)
  await build({
    root: cwd,
    logLevel: 'silent',
    plugins: bench ? [BuildTimePlugin(target)] : [],
  })
}

const baseTime = data.none.time

Object.values(data).forEach(v => v.pureTime = v.time - baseTime)

console.log(data)
