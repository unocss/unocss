import { join, resolve } from 'node:path'
import process from 'node:process'
import fs from 'fs-extra'
import { glob } from 'tinyglobby'
import { build } from 'vite'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'

const isWindows = process.platform === 'win32'
const isRolldownVite = 'rolldownVersion' in vite

async function getGlobContent(cwd: string, pattern: string) {
  return await glob([pattern], { cwd, absolute: true, expandDirectories: false })
    .then(r => Promise.all(r.map(f => fs.readFile(f, 'utf8'))))
    .then(r => r.join('\n'))
}

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

    const css = await getGlobContent(root, 'dist/**/*.css')
    const js = await getGlobContent(root, 'dist/**/*.js')

    // basic
    expect(css).contains('.text-red')
    // transformer-variant-group
    expect(css).contains('.text-sm')
    // transformer-compile-class
    expect(css).contains('.uno-tacwqa')
    // transformer-directives
    expect(css).not.contains('@apply')
    expect(css).contains('gap:.25rem')

    // transformer-variant-group
    expect(js).contains('text-sm')
    // transformer-compile-class
    expect(js).contains('uno-tacwqa')

    // @unocss-skip magic comment
    // test extract
    expect(css).not.contains('.text-yellow')
    // test transform
    expect(css).contains('--at-apply')
    expect(css).not.contains('gap:.5rem')
    expect(css).not.contains('.text-teal')
  })

  it.skipIf(isWindows || isRolldownVite)('vite legacy', async () => {
    const root = resolve(__dirname, 'fixtures/vite-legacy')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
    })

    const svgs = await glob(['dist/assets/uno-*.svg'], {
      cwd: root,
      absolute: true,
      expandDirectories: false,
    })
    expect(svgs).toHaveLength(1)

    const css = await getGlobContent(root, 'dist/**/index*.css')
    expect(css).contains('.text-red')
  }, 15000)

  it.skipIf(isWindows || isRolldownVite)('vite legacy renderModernChunks false', async () => {
    const root = resolve(__dirname, 'fixtures/vite-legacy-chunks')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
    })
    const css = await getGlobContent(root, 'dist/**/index*.js')
    expect(css).contains('.mb-\\\\[50px\\\\]')
  })

  it('vite lib', async () => {
    const root = resolve(__dirname, 'fixtures/vite-lib')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
      build: {
        sourcemap: true,
      },
    })

    const files = await glob(['dist/**/*.{umd,iife}.?(c)js'], {
      cwd: root,
      absolute: true,
      expandDirectories: false,
    })

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
  }, 15000)

  it.skipIf(isWindows)('vite lib rollupOptions', async () => {
    const root = resolve(__dirname, 'fixtures/vite-lib-rollupoptions')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
    })

    const files = await glob(['dist/**/index.js'], {
      cwd: root,
      absolute: true,
      expandDirectories: false,
    })
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
