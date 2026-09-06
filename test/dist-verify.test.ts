import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const roots: string[] = []
const script = resolve(import.meta.dirname, '../scripts/dist-verify.ts')

async function createFixture(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'unocss-dist-verify-'))
  roots.push(root)
  await Promise.all(Object.entries(files).map(async ([file, content]) => {
    const path = join(root, 'packages-test/fixture/dist', file)
    await mkdir(resolve(path, '..'), { recursive: true })
    await writeFile(path, content)
  }))
  return root
}

async function runChecker(root: string) {
  return await new Promise<{ code: number | null, output: string }>((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', 'tsx', script, root], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    child.stdout.on('data', data => output += data)
    child.stderr.on('data', data => output += data)
    child.on('error', reject)
    child.on('close', code => resolve({ code, output }))
  })
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('dist verification', () => {
  it('accepts runtime CJS requiring ESM-only packages and valid declarations', async () => {
    const root = await createFixture({
      // require() of an ESM-only package is valid at runtime on Node >= 22.12
      'index.cjs': 'const uno = require("@unocss/core")\nmodule.exports = { value: uno }',
      'index.d.cts': 'declare const value: number\nexport = value',
      'index.d.ts': 'import type { UnoGenerator } from \'@unocss/core\'',
    })

    const result = await runChecker(root)

    expect(result.code).toBe(0)
    expect(result.output).toContain('2 CJS declaration files found')
  })

  it.each([
    ['CJS declaration', 'index.d.cts', 'import uno = require("@unocss/core")\nexport = uno'],
    ['CJS declaration with default export', 'index.d.cts', 'import uno = require("@unocss/core")\nexport { uno as default }'],
  ])('rejects a forbidden import in %s even with a default export', async (_, file, content) => {
    const root = await createFixture({ [file]: content })

    const result = await runChecker(root)

    expect(result.code).toBe(1)
    expect(result.output).toContain(`Found forbidden code in packages-test/fixture/dist/${file}`)
    expect(result.output).toContain('require("@unocss/core")')
  })
})
