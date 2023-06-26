import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import fg from 'fast-glob'

const isMacOS = process.platform === 'darwin'
const isWindows = process.platform === 'win32'

async function getGlobContent(cwd: string, glob: string) {
  return await fg(glob, { cwd, absolute: true })
    .then(r => Promise.all(r.map(f => readFile(f, 'utf8'))))
    .then(r => r.join('\n'))
}

describe('svelte-scoped-vite', () => {
  it.skipIf(isWindows || isMacOS)('vite', async () => {
    await build({
      logLevel: 'error',
      build: {
        sourcemap: true,
      },
    })

    const css = await getGlobContent(process.cwd(), '.svelte-kit/**/*.css')

    expect(css).not.toContain('--at-apply')
    expect(css).toContain('gap:0.5rem')
    expect(css).toContain('background-color:rgba(0,0,0')
  }, 10000)
})
