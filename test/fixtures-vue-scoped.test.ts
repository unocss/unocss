import { readFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import presetWind4 from '@unocss/preset-wind4'
import UnoCSS from '@unocss/vite'
import Vue from '@vitejs/plugin-vue'
import { glob } from 'tinyglobby'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'

async function getGlobContent(cwd: string, pattern: string) {
  return await glob([pattern], { cwd, absolute: true, expandDirectories: false })
    .then(r => Promise.all(r.map(f => readFile(f, 'utf8'))))
    .then(r => r.join('\n'))
}

describe('vue-scoped fixtures', () => {
  const root = resolve(import.meta.dirname, 'fixtures/vite-vue-scoped')

  // https://github.com/unocss/unocss/issues/4825
  it('vite vue-scoped', async () => {
    await rm(join(root, 'dist'), { recursive: true, force: true })
    await build({ root, logLevel: 'warn' })

    const css = await getGlobContent(root, 'dist/**/*.css')
    // utilities are scoped to the component
    expect(css).contains('.text-red[data-v-')
    expect(css).contains('.text-blue-500[data-v-')
    // preflight layers are global, so CSS variables can be resolved
    expect(css).contains('--colors-red-DEFAULT')
    expect(css).contains('--colors-blue-500')
    expect(css).contains(':root')
    expect(css).not.contains(':root[data-v-')
    expect(css).not.contains('*[data-v-')

    // by default the generated CSS is injected after the SFC's own styles
    const brandIndex = css.indexOf('.brand[data-v-')
    const blueIndex = css.indexOf('.text-blue-500[data-v-')
    expect(brandIndex).toBeGreaterThan(-1)
    expect(blueIndex).toBeGreaterThan(-1)
    expect(brandIndex).toBeLessThan(blueIndex)
  })

  it('vite vue-scoped layer order', async () => {
    await rm(join(root, 'dist-layers'), { recursive: true, force: true })
    await build({
      root,
      configFile: false,
      logLevel: 'warn',
      plugins: [
        Vue(),
        UnoCSS({
          mode: 'vue-scoped',
          outputToCssLayers: true,
          presets: [presetWind4()],
        }),
      ],
      build: {
        outDir: 'dist-layers',
        emptyOutDir: true,
        minify: false,
      },
    })

    const css = await getGlobContent(root, 'dist-layers/**/*.css')
    const layerOrder = /@layer ([^;]+);/.exec(css)?.[1].split(/,\s*/) ?? []
    const order = (name: string) => layerOrder.indexOf(name)
    expect(order('properties')).toBeGreaterThan(-1)
    expect(order('theme')).toBeGreaterThan(-1)
    expect(order('base')).toBeGreaterThan(-1)
    expect(order('shortcuts')).toBeGreaterThan(-1)
    expect(order('default')).toBeGreaterThan(-1)
    expect(order('properties')).toBeLessThan(order('theme'))
    expect(order('theme')).toBeLessThan(order('base'))
    expect(order('base')).toBeLessThan(order('default'))
    expect(order('shortcuts')).toBeLessThan(order('default'))
  })

  // https://github.com/unocss/unocss/pull/4829#pullrequestreview-5603504498
  it('vite vue-scoped without preflights', async () => {
    await rm(join(root, 'dist-no-preflights'), { recursive: true, force: true })
    await build({
      root,
      configFile: false,
      logLevel: 'warn',
      plugins: [
        Vue(),
        UnoCSS({
          mode: 'vue-scoped',
          presets: [],
          rules: [['text-red', { color: 'red' }]],
        }),
      ],
      build: {
        outDir: 'dist-no-preflights',
        emptyOutDir: true,
      },
    })

    const css = await getGlobContent(root, 'dist-no-preflights/**/*.css')
    expect(css).contains('.text-red[data-v-')
    expect(css).not.contains('@layer')
  })

  it('vite vue-scoped dedupes preflight layers', async () => {
    await rm(join(root, 'dist-duplicate-layers'), { recursive: true, force: true })
    await build({
      root,
      configFile: false,
      logLevel: 'warn',
      plugins: [
        Vue(),
        UnoCSS({
          mode: 'vue-scoped',
          outputToCssLayers: true,
          presets: [],
          rules: [['text-red', { color: 'red' }]],
          preflights: [
            { layer: 'theme', getCSS: () => ':root{--duplicate-a:1}' },
            { layer: 'theme', getCSS: () => ':root{--duplicate-b:1}' },
          ],
        }),
      ],
      build: {
        outDir: 'dist-duplicate-layers',
        emptyOutDir: true,
        minify: false,
      },
    })

    const css = await getGlobContent(root, 'dist-duplicate-layers/**/*.css')
    expect(css).contains('@layer theme')
    expect(css).contains('--duplicate-a')
    expect(css).contains('--duplicate-b')
    expect((css.match(/--duplicate-a/g) || []).length).toBe(1)
    expect((css.match(/--duplicate-b/g) || []).length).toBe(1)
  })

  it('vite vue-scoped styleOrder before', async () => {
    await rm(join(root, 'dist-order'), { recursive: true, force: true })
    await build({
      root,
      configFile: false,
      logLevel: 'warn',
      plugins: [
        Vue(),
        UnoCSS({
          mode: 'vue-scoped',
          vueScoped: { styleOrder: 'before' },
          presets: [presetWind4()],
        }),
      ],
      build: {
        outDir: 'dist-order',
        emptyOutDir: true,
      },
    })

    const css = await getGlobContent(root, 'dist-order/**/*.css')
    const brandIndex = css.indexOf('.brand[data-v-')
    const blueIndex = css.indexOf('.text-blue-500[data-v-')
    expect(brandIndex).toBeGreaterThan(-1)
    expect(blueIndex).toBeGreaterThan(-1)
    expect(blueIndex).toBeLessThan(brandIndex)
  })

  it('vite vue-scoped lib', async () => {
    await rm(join(root, 'dist-lib'), { recursive: true, force: true })
    await build({
      root,
      configFile: false,
      logLevel: 'warn',
      plugins: [
        Vue(),
        UnoCSS({
          mode: 'vue-scoped',
          presets: [presetWind4()],
        }),
      ],
      build: {
        lib: {
          entry: resolve(root, 'src/main.ts'),
          formats: ['es'],
          fileName: 'lib',
        },
        outDir: 'dist-lib',
        emptyOutDir: true,
      },
    })

    const css = await getGlobContent(root, 'dist-lib/**/*.css')
    expect(css).contains('.text-red[data-v-')
    expect(css).contains(':root')
    expect(css).contains('--colors-red-DEFAULT')
    expect(css).contains('--spacing')
    expect(css).not.contains(':root[data-v-')
    expect(css).not.contains('*[data-v-')
  })
})
