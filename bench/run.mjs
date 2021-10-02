import { execSync } from 'child_process'
import fs from 'fs-extra'
import { dir, targets } from './meta.mjs'

const times = 20

await fs.writeJSON(`${dir}/result.json`, [], { spaces: 2 })

for (let i = 0; i < times; i++) {
  console.log(`x${i + 1}`)
  execSync('node build.mjs', { stdio: 'inherit' })
}

const result = await fs.readJSON(`${dir}/result.json`, [], { spaces: 2 })

const average = targets.map((target) => {
  const items = result.filter(i => i.name === target)
  const total = items.reduce((a, p) => a + p.time, 0)
  const average = total / items.length
  return [target, average]
})

const baseTime = average.find(i => i[0] === 'none')[1]
const fastest = average.sort((a, b) => a[1] - b[1])[1][1]

average.forEach(([name, t]) => {
  const d = t - baseTime
  const slowdown = d / (fastest - baseTime)
  console.log(name.padEnd(15, ' '), `${(t - baseTime).toFixed(2).padStart(8, ' ')} ms`, `(x${slowdown.toFixed(2)})`)
})
