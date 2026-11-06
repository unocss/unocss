import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { glob } from 'tinyglobby'
import { build } from 'vite'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const isMacOS = process.platform === 'darwin'
const isWindows = process.platform === 'win32'
const isCI = process.env.CI

const fixtureRoot = fileURLToPath(new URL('..', import.meta.url))
const originalCwd = process.cwd()

async function getGlobContent(cwd: string, pattern: string) {
  return await glob([pattern], { cwd, absolute: true, expandDirectories: false })
    .then(r => Promise.all(r.map(f => readFile(f, 'utf8'))))
    .then(r => r.join('\n'))
}

describe.skipIf(isCI && (isWindows || isMacOS))('@unocss/svelte-scoped/vite', () => {
  beforeAll(async () => {
    // `@sveltejs/kit` resolves its project from `process.cwd()` at import time,
    // so this suite must run from the fixture when driven by the root vitest project.
    process.chdir(fixtureRoot)
    await build({
      root: fixtureRoot,
      logLevel: 'error',
      build: {
        minify: false,
      },
    })
  }, 15000)

  afterAll(() => {
    process.chdir(originalCwd)
  })

  it('passing a transformer to cssFileTransformers transforms CSS files', async () => {
    const css = await getGlobContent(fixtureRoot, '.svelte-kit/output/**/*.css')
    expect(css).not.toContain('--at-apply')
    expect(css).toContain('gap:0.5rem')
    expect(css).toContain('background-color:rgb(0 0 0')
  })

  it('includes the default preset', async () => {
    const css = await getGlobContent(fixtureRoot, '.svelte-kit/output/**/*.css')
    expect(css).not.toContain('mb-1')
    expect(css).toContain('margin-bottom:0.25rem')
  })
})
