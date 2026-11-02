import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { join, resolve } from 'node:path'
import process from 'node:process'

const directory = process.env.BENCHMARK_REPORT_DIR
if (!directory)
  throw new Error('BENCHMARK_REPORT_DIR is required')
await mkdir(directory, { recursive: true })
const directories = { current: resolve('current') }
if (process.env.BENCHMARK_BASE_DIR)
  directories.base = process.env.BENCHMARK_BASE_DIR
const samples = { current: [], base: [] }
console.log(`Node ${process.version}; CPU ${cpus()[0]?.model}; three alternating measurement rounds`)

for (let round = 0; round < 3; round++) {
  const order = round % 2 === 0 ? ['base', 'current'] : ['current', 'base']
  for (const side of order) {
    if (!directories[side])
      continue
    const output = join(directory, `${side}-${round + 1}.json`)
    console.log(`Measuring ${side}, round ${round + 1}/3`)
    execFileSync('pnpm', [
      'exec',
      'vitest',
      'bench',
      'packages-engine/core/test',
      '--run',
      '--reporter=json',
      '--outputFile',
      output,
    ], { cwd: directories[side], stdio: 'inherit' })
    samples[side].push(JSON.parse(await readFile(output, 'utf8')))
  }
}

for (const side of Object.keys(directories))
  await writeFile(join(directory, `${side}.json`), JSON.stringify({ samples: samples[side] }))
