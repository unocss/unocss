import { join, resolve } from 'pathe'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import fg from 'fast-glob'

describe.concurrent('fixtures', () => {
  it('vite client', async () => {
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

  // FIXME: https://github.com/vitejs/vite/issues/10137
  it.fails('vite lib', async () => {
    const root = resolve(__dirname, 'fixtures/vite-lib')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
      build: {
        sourcemap: true,
      },
    })

    const files = await fg('dist/**/*.{umd,iife}.js', { cwd: root, absolute: true })

    expect(files).toHaveLength(2)

    for (const path of files) {
      const code = await fs.readFile(path, 'utf-8')
      // basic
      expect(code).contains('.text-red')
      // transformer-variant-group
      expect(code).contains('.text-sm')
      // transformer-compile-class
      expect(code).contains('.uno-tacwqa')
      // transformer-directives
      expect(code).not.contains('@apply')
      expect(code).not.contains('--at-apply')
      expect(code).contains('gap:.25rem')
      expect(code).contains('gap:.5rem')

      // transformer-variant-group
      expect(code).contains('text-sm')
      // transformer-compile-class
      expect(code).contains('uno-tacwqa')
    }
  })
})
