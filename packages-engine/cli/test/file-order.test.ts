import { rm } from 'node:fs/promises'
import { resolve } from 'pathe'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { startCli } from '../src/cli-start'
import { getTestDir, outputFile, readFile } from './utils'

const globOrder = vi.hoisted(() => ({ reverse: false, calls: 0 }))

vi.mock('tinyglobby', async (importOriginal) => {
  const mod = await importOriginal<typeof import('tinyglobby')>()
  return {
    ...mod,
    glob: async (...args: Parameters<typeof mod.glob>) => {
      const files = await mod.glob(...args)
      globOrder.calls++
      return globOrder.reverse ? files.reverse() : files
    },
  }
})

const testDirs: string[] = []

afterAll(async () => {
  await Promise.all(testDirs.map(dir => rm(dir, { recursive: true, force: true })))
})

async function build(reverse: boolean) {
  const testDir = getTestDir()
  testDirs.push(testDir)
  await outputFile(resolve(testDir, 'views/a/index.ts'), `'text-red-500 p-4'`)
  await outputFile(resolve(testDir, 'views/b/index.ts'), `'bg-blue-500 m-2'`)
  await outputFile(resolve(testDir, 'uno.config.ts'), `
import { defineConfig, presetWind4 } from 'unocss'
export default defineConfig({ presets: [presetWind4()] })
`)
  globOrder.reverse = reverse
  await startCli(testDir, ['', '', 'views/**/*'])
  return readFile(testDir)
}

describe('cli file order', () => {
  it('generates the same output regardless of glob result order', async () => {
    const reversed = await build(true)
    const output = await build(false)

    expect(globOrder.calls).toBe(2)
    expect(reversed).toBe(output)
  })
})
