/* eslint-disable no-console */
import { execSync } from 'child_process'
import fs from 'fs-extra'
import { dir, targets, getVersions } from './meta.mjs'

const times = 50
const versions = await getVersions()

console.log(versions)

await run()
await report()

async function run() {
  await fs.writeJSON(`${dir}/result.json`, [], { spaces: 2 })

  for (let i = 0; i < times; i++) {
    console.log(`x${i + 1}`)
    execSync('node build.mjs', { stdio: 'inherit' })
  }
}

async function report() {
  const result = await fs.readJSON(`${dir}/result.json`, [], { spaces: 2 })

  const average = targets.map((target) => {
    const items = result.filter(i => i.name === target)
    const total = items.reduce((a, p) => a + p.time, 0)
    const average = total / items.length
    return [target, average]
  })

  const baseTime = average.find(i => i[0] === 'none')[1]
  const fastest = average.sort((a, b) => a[1] - b[1])[1][1]

  const delta = average.map(([target, avg]) => {
    return [target, avg - baseTime]
  })

  console.log('\n\n')

  const logs = []

  logs.push(new Date().toLocaleString())
  logs.push(`1064 utilities | x${result.length / targets.length} runs`)
  logs.push('')

  average.forEach(([name, average]) => {
    const d = average - baseTime
    const slowdown = d / (fastest - baseTime)
    logs.push([
      name.padEnd(15, ' '),
      `avg.${average.toFixed(2).padStart(8, ' ')} ms /`,
      `delta.${(average - baseTime).toFixed(2).padStart(8, ' ')} ms`,
      slowdown ? `(x${slowdown.toFixed(2)})` : '',
    ].join(' '))
  })

  console.log(logs.join('\n'))

  const date = new Date().toISOString().replace(/[:T.]/g, '-').slice(0, -5)

  await fs.writeJSON(`${dir}/results/${date}.json`, {
    time: new Date(),
    versions,
    average: Object.fromEntries(average),
    delta: Object.fromEntries(delta),
    runs: result,
  }, { spaces: 2 })
  await fs.writeFile(`${dir}/results/${date}.md`, `\`\`\`\n${logs.join('\n')}\n\`\`\``)
}
