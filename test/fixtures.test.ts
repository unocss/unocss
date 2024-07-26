import { join, resolve } from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'
import fs from 'fs-extra'
import fg from 'fast-glob'

const isMacOS = process.platform === 'darwin'
const isWindows = process.platform === 'win32'
const isNode16 = process.versions.node.startsWith('16')

async function getGlobContent(cwd: string, glob: string) {
  return await fg(glob, { cwd, absolute: true })
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

  it.skipIf(isWindows)('vite legacy', async () => {
    const root = resolve(__dirname, 'fixtures/vite-legacy')
    await fs.emptyDir(join(root, 'dist'))
    await build({
      root,
      logLevel: 'warn',
    })

    const svgs = await fg('dist/assets/uno-*.svg', { cwd: root, absolute: true })
    expect(svgs).toHaveLength(1)

    const css = await getGlobContent(root, 'dist/**/index*.css')
    expect(css).contains('.text-red')
  }, 15000)

  it.skipIf(isWindows)('vite legacy renderModernChunks false', async () => {
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

    const files = await fg('dist/**/*.{umd,iife}.?(c)js', { cwd: root, absolute: true })

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

    const files = await fg(['dist/**/index.js'], { cwd: root, absolute: true })
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

  it.skipIf(isMacOS || isNode16)('vue cli 4', async () => {
    const root = resolve(__dirname, '../examples/vue-cli4')
    await fs.emptyDir(join(root, 'dist'))
    await execa('npm', ['run', 'build'], { cwd: root })

    const css = await getGlobContent(root, 'dist/**/*.css')

    expect(css).contains('.w-200px')
    expect(css).contains('[font~="mono"]')
  }, 60_000)

  // something wrong with webpack, skip for now
  it.skip('vue cli 5', async () => {
    const root = resolve(__dirname, '../examples/vue-cli5')
    await fs.emptyDir(join(root, 'dist'))
    await execa('npm', ['run', 'build'], { stdio: 'ignore', cwd: root })

    const css = await getGlobContent(root, 'dist/**/*.css')

    expect(css).contains('.w-200px')
    expect(css).contains('[font~="mono"]')
  }, 60_000)
})
