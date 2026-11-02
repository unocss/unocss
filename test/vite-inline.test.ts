import type { VitePluginConfig } from '@unocss/vite'
import type { InlineConfig, Rollup } from 'vite'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import UnoCSS from '@unocss/vite'
import postcss from 'postcss'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'

const root = resolve(import.meta.dirname, 'fixtures/vite-legacy/src')
const entry = resolve(root, 'inline-entry.js')
const inlineImport = 'import css from "virtual:uno.css?inline"'
const normalImport = 'import "virtual:uno.css"'

async function buildInline(imports: string[], uno: VitePluginConfig = {}, css?: InlineConfig['css'], entryFile = entry, config: Pick<InlineConfig, 'build' | 'plugins'> = {}) {
  const result = await build({
    root,
    configFile: false,
    publicDir: false,
    logLevel: 'silent',
    base: '/inline-test/',
    css,
    plugins: [
      ...config.plugins || [],
      {
        name: 'test:inline-entry',
        resolveId(id) {
          if (id === entryFile)
            return id
        },
        load(id) {
          if (id === entryFile)
            return `${imports.join('\n')}\nexport default css`
        },
      },
      UnoCSS({
        configFile: false,
        presets: [],
        rules: [['test-rule', { color: 'red' }]],
        safelist: ['test-rule'],
        ...uno,
      }),
    ],
    build: {
      write: false,
      minify: false,
      cssMinify: false,
      assetsInlineLimit: 0,
      // Keep a pure ES entry with its default export, without library mode's forced asset inlining.
      rollupOptions: {
        input: entryFile,
        preserveEntrySignatures: 'strict',
        output: { format: 'es' },
      },
      ...config.build,
    },
  }) as Rollup.RollupOutput

  const chunks = result.output.filter(item => item.type === 'chunk')
  expect(chunks).toHaveLength(1)
  const url = `data:text/javascript;base64,${Buffer.from(chunks[0].code).toString('base64')}`
  const { default: inline } = await import(/* @vite-ignore */ url)
  expect(inline).toBeTypeOf('string')

  const assets = result.output.filter(item => item.type === 'asset')
  const stylesheets = assets.filter(asset => asset.fileName.endsWith('.css'))
  return {
    inline: inline as string,
    assets,
    stylesheets,
    css: stylesheets.map(asset => Buffer.from(asset.source).toString()).join('\n'),
  }
}

function declarations(css: string, selector: string, property: string) {
  const values: string[] = []
  postcss.parse(css).walkRules(selector, (rule) => {
    rule.walkDecls(property, (decl) => {
      values.push(decl.value)
    })
  })
  return values
}

describe('vite inline CSS', () => {
  it.each([
    { normal: false, placeholderOnly: false },
    { normal: true, placeholderOnly: false },
    { normal: false, placeholderOnly: true },
  ])('applies CSS minification and browser targets (normal: $normal, placeholder only: $placeholderOnly)', async ({ normal, placeholderOnly }) => {
    const result = await buildInline(normal ? [normalImport, inlineImport] : [inlineImport], {
      rules: [['test-rule', { 'user-select': 'none' }]],
      preflights: [{ getCSS: () => '.preflight { color: rgb(255, 0, 0); }' }],
    }, undefined, entry, {
      build: { cssMinify: true, cssTarget: 'safari12' },
      plugins: placeholderOnly
        ? [{
            name: 'test:placeholder-only',
            renderChunk: {
              order: 'pre',
              handler(code, chunk) {
                expect(code).toContain('#--unocss--')
                const ids = Object.keys(chunk.modules).filter(id => id.includes('__uno'))
                expect(ids.length).toBeGreaterThan(0)
                for (const id of ids)
                  delete chunk.modules[id]
              },
            },
          }]
        : [],
    })

    expect(declarations(result.inline, '.test-rule', '-webkit-user-select')).toEqual(['none'])
    expect(declarations(result.inline, '.test-rule', 'user-select')).toEqual(['none'])
    expect(result.inline).toContain('.preflight{color:red}')
    expect(result.stylesheets).toHaveLength(normal ? 1 : 0)
    if (normal) {
      expect(declarations(result.css, '.test-rule', '-webkit-user-select')).toEqual(['none'])
      expect(result.inline).toBe(result.css.trim())
    }
  })

  it('supports importer paths containing apostrophes', async () => {
    const result = await buildInline([inlineImport], {}, {
      postcss: { plugins: [{ postcssPlugin: 'test:parse' }] },
    }, resolve(root, 'it\'s/inline-entry.js'))

    expect(declarations(result.inline, '.test-rule', 'color')).toEqual(['red'])
  })

  it('exports multiline preflights without changing their contents when postcss is disabled', async () => {
    const preflight = '.preflight {\r\n  --double: "double";\r  --single: \'single\';\n  --slash: "\\\\path";\n  --unicode: "\u2028\u2029";\n}'
    const result = await buildInline([inlineImport], {
      postcss: false,
      preflights: [{ getCSS: () => preflight }],
    })

    expect(result.inline).toContain(preflight)
    expect(declarations(result.inline, '.test-rule', 'color')).toEqual(['red'])
    expect(result.stylesheets).toHaveLength(0)
  })

  it.each([
    { order: 'normal first', imports: [normalImport, inlineImport] },
    { order: 'inline first', imports: [inlineImport, normalImport] },
  ])('preserves the inline export and normal CSS asset with $order', async ({ imports }) => {
    const result = await buildInline(imports)

    expect(declarations(result.inline, '.test-rule', 'color')).toEqual(['red'])
    expect(result.stylesheets).toHaveLength(1)
    expect(declarations(result.css, '.test-rule', 'color')).toEqual(['red'])
  })

  it.each([
    { normal: false, cssMinify: false },
    { normal: true, cssMinify: false },
    { normal: false, cssMinify: true },
    { normal: true, cssMinify: true },
  ])('runs inline CSS through PostCSS (normal import: $normal, minify: $cssMinify)', async ({ normal, cssMinify }) => {
    const result = await buildInline(normal ? [inlineImport, normalImport] : [inlineImport], {}, {
      postcss: {
        plugins: [{
          postcssPlugin: 'test:red-to-green',
          Declaration(decl) {
            if (decl.prop === 'color' && decl.value === 'red')
              decl.value = 'green'
          },
        }],
      },
    }, entry, { build: { cssMinify } })

    expect(declarations(result.inline, '.test-rule', 'color')).toEqual(['green'])
    expect(result.stylesheets).toHaveLength(normal ? 1 : 0)
    if (normal)
      expect(declarations(result.css, '.test-rule', 'color')).toEqual(['green'])
  })

  it.each([
    { normal: false, cssMinify: false },
    { normal: true, cssMinify: false },
    { normal: false, cssMinify: true },
    { normal: true, cssMinify: true },
  ])('resolves and emits inline CSS assets (normal import: $normal, minify: $cssMinify)', async ({ normal, cssMinify }) => {
    const result = await buildInline(normal ? [inlineImport, normalImport] : [inlineImport], {
      rules: [['test-image', { 'background-image': 'url(./uno.svg)' }]],
      safelist: ['test-image'],
    }, undefined, entry, { build: { cssMinify } })

    const images = result.assets.filter(asset => asset.fileName.endsWith('.svg'))
    expect(images).toHaveLength(1)
    expect(Buffer.from(images[0].source)).toEqual(await readFile(resolve(root, 'uno.svg')))
    const expectedUrl = `/inline-test/${images[0].fileName}`
    const styles = normal ? [result.inline, result.css] : [result.inline]
    for (const css of styles) {
      const values = declarations(css, '.test-image', 'background-image')
      expect(values).toHaveLength(1)
      // Vite versions differ in whether CSS URLs are quoted.
      expect(/^url\((["']?)(.*?)\1\)$/.exec(values[0])?.[2]).toBe(expectedUrl)
    }
    expect(result.stylesheets).toHaveLength(normal ? 1 : 0)
  })

  it('keeps named inline layers separate from the normal aggregate stylesheet', async () => {
    const result = await buildInline([
      normalImport,
      'import css from "virtual:uno:custom.css?inline"',
    ], {
      rules: [
        ['test-rule', { color: 'red' }],
        ['custom-rule', { color: 'blue' }, { layer: 'custom' }],
      ],
      safelist: ['test-rule', 'custom-rule'],
    })

    expect(declarations(result.inline, '.custom-rule', 'color')).toEqual(['blue'])
    expect(declarations(result.inline, '.test-rule', 'color')).toEqual([])
    expect(result.stylesheets).toHaveLength(1)
    expect(declarations(result.css, '.test-rule', 'color')).toEqual(['red'])
    expect(declarations(result.css, '.custom-rule', 'color')).toEqual([])
  })
})
