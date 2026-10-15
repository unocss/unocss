import { execFile } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import presetUno from '@unocss/preset-uno'
import { glob } from 'tinyglobby'
import { build, createBuilder } from 'vite'
import * as vite from 'vite'
import { describe, expect, it } from 'vitest'
import UnoCSS from '../packages-integrations/vite/src/index'

const execFileAsync = promisify(execFile)
const isWindows = process.platform === 'win32'
const isRolldownVite = 'rolldownVersion' in vite

async function getGlobContent(cwd: string, pattern: string) {
  return await glob([pattern], { cwd, absolute: true, expandDirectories: false })
    .then(r => Promise.all(r.map(f => readFile(f, 'utf8'))))
    .then(r => r.join('\n'))
}

async function getHtmlCss(root: string, file: string) {
  const html = await readFile(join(root, file), 'utf-8')
  const hrefs = [...html.matchAll(/<link[^>]+href="\/([^"]+\.css)"[^>]*>/g)]
    .map(match => match[1])
  const styles = [...html.matchAll(/<style[^>]*>(.*?)<\/style>/gs)]
    .map(match => match[1])
  const linkedCss = await Promise.all(hrefs.map(href => readFile(join(root, href), 'utf-8')))
  return [...styles, ...linkedCss].join('\n')
}

describe.concurrent('fixtures', () => {
  it('vite client', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite')
    await rm(join(root, 'dist'), { recursive: true, force: true })
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

  it('vite dist-chunk', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-dist-chunk')
    await rm(join(root, 'dist'), { recursive: true, force: true })
    await build({ root, logLevel: 'warn' })

    // Assumes base '/' and a single generated stylesheet link per entry.
    const cssHref = (html: string) => /href="\/([^"]+\.css)"/.exec(html)?.[1]
    const aHtml = await readFile(join(root, 'dist/a.html'), 'utf-8')
    const bHtml = await readFile(join(root, 'dist/b.html'), 'utf-8')
    const aCss = await readFile(join(root, 'dist', cssHref(aHtml)!), 'utf-8')
    const bCss = await readFile(join(root, 'dist', cssHref(bHtml)!), 'utf-8')

    expect(aCss).contains('.text-red')
    expect(aCss).not.contains('.c-red')
    expect(bCss).contains('.c-red')
    expect(bCss).not.contains('.text-red')
  })

  it.skipIf(isWindows)('astro dist-chunk', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/astro-dist-chunk')
    await rm(join(root, 'dist'), { recursive: true, force: true })

    const require = createRequire(join(root, 'package.json'))
    const astroCli = resolve(dirname(require.resolve('astro')), '../../astro.js')
    await execFileAsync(process.execPath, [astroCli, 'build', '--root', root], {
      cwd: root,
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: '1',
      },
    })

    const aCss = await getHtmlCss(root, 'dist/a.html')
    const bCss = await getHtmlCss(root, 'dist/b.html')

    expect(aCss).contains('box-sizing:border-box')
    expect(aCss).contains('.text-xl')
    expect(aCss).not.contains('.c-red')
    expect(bCss).contains('box-sizing:border-box')
    expect(bCss).contains('.c-red')
    expect(bCss).not.contains('.text-xl')
  })

  it.skipIf(isWindows || isRolldownVite)('vite legacy', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-legacy')
    await rm(join(root, 'dist'), { recursive: true, force: true })
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
    const root = resolve(import.meta.dirname, 'fixtures/vite-legacy-chunks')
    await rm(join(root, 'dist'), { recursive: true, force: true })
    await build({
      root,
      logLevel: 'warn',
    })
    const css = await getGlobContent(root, 'dist/**/index*.js')
    expect(css).contains('.mb-\\\\[50px\\\\]')
  })

  it('vite lib', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-lib')
    await rm(join(root, 'dist'), { recursive: true, force: true })
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
      const code = await readFile(path, 'utf-8')
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
    const root = resolve(import.meta.dirname, 'fixtures/vite-lib-rollupoptions')
    await rm(join(root, 'dist'), { recursive: true, force: true })
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
      const code = await readFile(path, 'utf-8')
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

  // https://github.com/unocss/unocss/issues/4884
  it('vite client virtual:uno.css?inline', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-inline')
    await rm(join(root, 'dist'), { recursive: true, force: true })
    await build({
      root,
      logLevel: 'warn',
    })

    const js = await getGlobContent(root, 'dist/**/*.js')
    expect(js).contains('.text-red')
  })

  // https://github.com/unocss/unocss/issues/5323
  it.skipIf(isWindows)('vite environments with shared config build', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-environments')
    await rm(join(root, 'dist-client'), { recursive: true, force: true })
    await rm(join(root, 'dist-ssr'), { recursive: true, force: true })

    const builder = await createBuilder({ root, logLevel: 'warn' })
    await builder.buildApp()

    const css = await getGlobContent(root, 'dist-client/**/*.css')
    expect(css).contains('.text-red')
  })

  // https://github.com/unocss/unocss/issues/5329
  it.skipIf(isWindows)('vite environments with per-environment configs', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-environments-isolated')
    await rm(join(root, 'dist-client'), { recursive: true, force: true })
    await rm(join(root, 'dist-ssr'), { recursive: true, force: true })

    // inline config, as frameworks like Astro pass it: without
    // `sharedConfigBuild`, the same UnoCSS plugin instance sees one
    // configResolved per environment, each with its own vite:css-post instance
    const builder = await createBuilder({
      root,
      configFile: false,
      logLevel: 'warn',
      environments: {
        client: {
          build: {
            outDir: 'dist-client',
          },
        },
        ssr: {
          build: {
            outDir: 'dist-ssr',
            ssr: true,
            rollupOptions: {
              input: 'src/entry-server.ts',
            },
          },
        },
      },
      builder: {
        async buildApp(builder) {
          // client first: its outDir must not resolve to another environment's
          // css-post instance, whose build never ran (#5329)
          await builder.build(builder.environments.client)
          await builder.build(builder.environments.ssr)
        },
      },
      plugins: [
        UnoCSS({
          configFile: false,
          presets: [presetUno()],
        }),
      ],
    })
    await builder.buildApp()

    const css = await getGlobContent(root, 'dist-client/**/*.css')
    expect(css).contains('.text-red')
  })
})
