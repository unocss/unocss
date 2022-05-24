import { resolve } from 'path'
import fs from 'fs-extra'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execa } from 'execa'

export const tempDir = resolve('.temp')
export const cli = resolve(__dirname, '../packages/cli/src/cli.ts')

beforeAll(async () => {
  await fs.remove(tempDir)
})

afterAll(async () => {
  await fs.remove(tempDir)
})

describe('cli', () => {
  it('builds uno.css', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="p-4 max-w-screen-md"></div>',
    })

    expect(output).toMatchSnapshot()
  })

  it('supports unocss.config.js', async () => {
    const { output } = await runCli({
      'views/index.html': '<div class="box"></div>',
      'unocss.config.js': `
import { defineConfig } from 'unocss'
export default defineConfig({
  shortcuts: [{ box: 'max-w-7xl mx-auto bg-gray-100 rounded-md shadow-sm p-4' }]
})
    `.trim(),
    })

    expect(output).toMatchSnapshot()
  }, 30000)
})

async function runCli(files: Record<string, string>) {
  const testDir = resolve(tempDir, Math.round(Math.random() * 100000).toString())

  await Promise.all(
    Object.entries(files).map(([path, content]) =>
      fs.outputFile(resolve(testDir, path), content, 'utf8'),
    ),
  )

  const { exitCode, stdout, stderr } = await execa('npx', ['esno', cli, 'views/**/*'], {
    cwd: testDir,
    stdio: 'pipe',
  })

  const logs = stdout + stderr
  if (exitCode !== 0)
    throw new Error(logs)

  const output = await fs.readFile(resolve(testDir, 'uno.css'), 'utf8')

  return {
    output,
    logs,
  }
}
