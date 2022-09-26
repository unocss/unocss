/* eslint-disable no-console */
import { execSync } from 'child_process'
import { join } from 'pathe'
import fs from 'fs-extra'
import { escapeSelector } from '@unocss/core'
import { dir, getVersions, targets } from './meta.mjs'
import { classes, writeMock } from './gen.mjs'

const times = 200
const metric = '75%' // average / min / 50% / 75% / 95% / 99%
const versions = await getVersions()
await run()
await report()

async function run() {
  await fs.writeJSON(`${dir}/result.json`, [], { spaces: 2 })

  for (let i = 0; i < times; i++) {
    console.log(`\n(${i + 1}/${times})`)
    await writeMock()
    execSync('node build.mjs', { stdio: 'inherit' })
  }
}

async function checkClasses() {
  for (const name of targets) {
    if (name === 'none')
      continue
    const dist = join(dir, 'fixtures', name, 'dist/assets')
    const file = (await fs.readdir(dist)).find(i => i.endsWith('.css'))
    const content = await fs.readFile(join(dist, file), 'utf-8')
    const lose = classes.filter(i => !content.includes(escapeSelector(i)))
    if (lose.length) {
      console.log(name.padEnd(12), `${lose.length} unmatched`)
      console.log(lose)
    }
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

  const percentile = percent =>
    targets.map((target) => {
      const items = result.filter(i => i.name === target)
      const sorted = items.sort((a, b) => a.time - b.time)
      const index = Math.floor(sorted.length * percent)
      return [target, sorted[index].time]
    })
  const fifty = percentile(0.5)
  const seventyFive = percentile(0.75)
  const ninetyFive = percentile(0.95)
  const ninetyNine = percentile(0.99)

  // base on what you want to compare
  const data = { average, 'min': minimum, '50%': fifty, '75%': seventyFive, '95%': ninetyFive, '99%': ninetyNine }[metric]

  const baseTime = data.find(i => i[0] === 'none')[1]
  const fastest = data.sort((a, b) => a[1] - b[1])[1][1]

  const delta = data.map(([target, m]) => {
    return [target, m - baseTime]
  })

  console.log('\n')

  await checkClasses()

  console.log('\n')

  const logs = []

  logs.push(new Date().toLocaleString())
  logs.push(`${classes.length} utilities | x${result.length / targets.length} runs (${metric} build time)`)
  logs.push('')

  data.forEach(([name, t]) => {
    const d = delta.find(i => i[0] === name)[1]
    const slowdown = d / (fastest - baseTime)
    logs.push([
      name.padEnd(12, ' '),
      (versions[name] ? `v${(versions[name])}` : '').padEnd(14, ' '),
      `${t.toFixed(2).padStart(10, ' ')} ms /`,
      `delta.${(d).toFixed(2).padStart(10, ' ')} ms`,
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
    fifty: Object.fromEntries(fifty),
    seventyFive: Object.fromEntries(seventyFive),
    ninetyFive: Object.fromEntries(ninetyFive),
    ninetyNine: Object.fromEntries(ninetyNine),
    delta: Object.fromEntries(delta),
    runs: result,
  }, { spaces: 2 })

  await fs.writeFile(`${dir}/results/${date}.md`, `\`\`\`\n${logs.join('\n')}\n\`\`\``)
}
