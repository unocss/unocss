/* eslint-disable no-console */
import { execSync } from 'child_process'
import fs from 'fs-extra'
import { dir, targets, getVersions } from './meta.mjs'
import { generateMock } from './gen.mjs'

const times = 50
const versions = await getVersions()

console.log(versions)

const classes = await generateMock()
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

  const minimum = targets.map((target) => {
    return [target, result.filter(i => i.name === target).sort((a, b) => a.time - b.time)[0].time]
  })

  const baseTime = minimum.find(i => i[0] === 'none')[1]
  const fastest = minimum.sort((a, b) => a[1] - b[1])[1][1]

  const delta = minimum.map(([target, m]) => {
    return [target, m - baseTime]
  })

  console.log('\n\n')

  const logs = []

  logs.push(new Date().toLocaleString())
  logs.push(`${classes.length} utilities | x${result.length / targets.length} runs`)
  logs.push('')

  minimum.forEach(([name, min]) => {
    const d = delta.find(i => i[0] === name)[1]
    const slowdown = d / (fastest - baseTime)
    logs.push([
      name.padEnd(15, ' '),
      `min.${min.toFixed(2).padStart(8, ' ')} ms /`,
      `delta.${(d).toFixed(2).padStart(8, ' ')} ms`,
      slowdown ? `(x${slowdown.toFixed(2)})` : '',
    ].join(' '))
  })

  console.log(logs.join('\n'))

  const date = new Date().toISOString().replace(/[:T.]/g, '-').slice(0, -5)

  await fs.writeJSON(`${dir}/results/${date}.json`, {
    time: new Date(),
    versions,
    utilities: classes.length,
    minimum: Object.fromEntries(minimum),
    average: Object.fromEntries(average),
    delta: Object.fromEntries(delta),
    runs: result,
  }, { spaces: 2 })
  await fs.writeFile(`${dir}/results/${date}.md`, `\`\`\`\n${logs.join('\n')}\n\`\`\``)
}
