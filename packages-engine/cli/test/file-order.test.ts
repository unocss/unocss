import { rm } from 'node:fs/promises'
import { resolve } from 'pathe'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { startCli } from '../src/cli-start'
import { outputFile, readFile } from './utils'

// Reverse the glob result to prove the output does not depend on it.
const globOrder = vi.hoisted(() => ({ reverse: false }))

vi.mock('tinyglobby', async (importOriginal) => {
  const mod = await importOriginal<typeof import('tinyglobby')>()
  return {
    ...mod,
    glob: async (...args: Parameters<typeof mod.glob>) => {
      const files = await mod.glob(...args)
      return globOrder.reverse ? files.reverse() : files
    },
  }
})

// `cli.test.ts` wipes the shared `_temp` dir, so use our own root.
const tempRoot = resolve('_temp-file-order')

function getTestDir() {
  return resolve(tempRoot, Math.round(Math.random() * 100000).toString())
}

afterAll(async () => {
  await rm(tempRoot, { recursive: true, force: true })
})

async function build(reverse: boolean) {
  const testDir = getTestDir()
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
  it('produces identical css regardless of glob result order', async () => {
    const normal = await build(false)
    const reversed = await build(true)

    expect(normal).toContain(':root, :host')
    expect(reversed).toBe(normal)
  })
})
