import { join, resolve } from 'path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import fg from 'fast-glob'

describe('vite', () => {
  it('build', async () => {
    const root = resolve(__dirname, 'fixtures/vite')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
      build: {
        sourcemap: true,
      },
    })

    const css = await fg('dist/**/*.css', { cwd: root, absolute: true })
      .then(r => Promise.all(r.map(f => fs.readFile(f, 'utf8'))))
      .then(r => r.join('\n'))

    const js = await fg('dist/**/*.js', { cwd: root, absolute: true })
      .then(r => Promise.all(r.map(f => fs.readFile(f, 'utf8'))))
      .then(r => r.join('\n'))

    // basic
    expect(css).contains('.text-red')
    // transformer-variant-group
    expect(css).contains('.text-sm')
    // transformer-compile-class
    expect(css).contains('.uno-tacwqa')
    // transformer-directives
    expect(css).not.contains('@apply')
    expect(css).not.contains('--at-apply')
    expect(css).contains('gap:.25rem')
    expect(css).contains('gap:.5rem')

    // transformer-variant-group
    expect(js).contains('text-sm')
    // transformer-compile-class
    expect(js).contains('uno-tacwqa')
  })
})
