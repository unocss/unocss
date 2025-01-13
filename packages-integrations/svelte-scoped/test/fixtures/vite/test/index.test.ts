import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { glob } from 'tinyglobby'
import { build } from 'vite'
import { beforeAll, describe, expect, it } from 'vitest'

const isMacOS = process.platform === 'darwin'
const isWindows = process.platform === 'win32'
const isCI = process.env.CI

async function getGlobContent(cwd: string, pattern: string) {
  return await glob([pattern], { cwd, absolute: true, expandDirectories: false })
    .then(r => Promise.all(r.map(f => readFile(f, 'utf8'))))
    .then(r => r.join('\n'))
}

describe.skipIf(isCI && (isWindows || isMacOS))('@unocss/svelte-scoped/vite', () => {
  beforeAll(async () => {
    await build({
      logLevel: 'error',
      build: {
        minify: false,
      },
    })
  }, 15000)

  it('passing a transformer to cssFileTransformers transforms CSS files', async () => {
    const css = await getGlobContent(process.cwd(), '.svelte-kit/output/**/*.css')
    expect(css).not.toContain('--at-apply')
    expect(css).toContain('gap:0.5rem')
    expect(css).toContain('background-color:rgb(0 0 0')
  })

  it('includes the default preset', async () => {
    const css = await getGlobContent(process.cwd(), '.svelte-kit/output/**/*.css')
    expect(css).not.toContain('mb-1')
    expect(css).toContain('margin-bottom:0.25rem')
  })
})
