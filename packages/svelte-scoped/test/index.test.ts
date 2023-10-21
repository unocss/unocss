import { describe, expect, it } from 'vitest'
import { preprocess } from 'svelte/compiler'
import { format as prettier } from 'prettier'
import fs from 'fs-extra'

// @ts-expect-error missing types
import prettierSvelte from 'prettier-plugin-svelte'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import presetTypography from '@unocss/preset-typography'
import UnocssSveltePreprocess from '../src/preprocess'
import type { UnocssSveltePreprocessOptions } from '../src/preprocess'
import { replaceGlobalStylesPlaceholder } from '../src/_vite/global'
import { GLOBAL_STYLES_PLACEHOLDER } from '../src/_vite/constants'

const defaultOptions: UnocssSveltePreprocessOptions = {
  configOrPath: {
    safelist: ['mb-7px', 'uno-prose'],
    presets: [
      presetUno(),
      presetIcons({
        prefix: 'i-',
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
      presetTypography({
        selectorName: 'uno-prose',
      }),
    ],
  },
}

describe('svelte-preprocessor', () => {
  async function preprocessSFC(code: string, filename = 'Foo.svelte', options: UnocssSveltePreprocessOptions = {}): Promise<string> {
    options = { ...defaultOptions, ...options }
    const result = await preprocess(code, [UnocssSveltePreprocess(options)], { filename })
    return prettier(result.code, {
      parser: 'svelte',
      plugins: [prettierSvelte],
    })
  }

  const cases = import.meta.glob('./cases/**/Input.svelte', { as: 'raw' })
  for (const [path, loadRaw] of Object.entries(cases)) {
    it(path.replace(/.\/cases\/(.+)\/Input.svelte/, '$1'), async () => {
      const dev = await preprocessSFC(await loadRaw(), path, { combine: false })
      expect(dev).toMatchFileSnapshot(path.replace('Input.svelte', 'OutputDev.svelte'))
      const prod = await preprocessSFC(await loadRaw(), path)
      expect(prod).toMatchFileSnapshot(path.replace('Input.svelte', 'OutputProd.svelte'))
    })
  }
})

describe('svelte-scoped helpers', () => {
  it('escape template literal characters in placeholder replacement', async () => {
    const css = await fs.readFile('packages/svelte-scoped/test/fixtures/escaped-unicode.css', 'utf8')

    const escaped = replaceGlobalStylesPlaceholder(
      `'${GLOBAL_STYLES_PLACEHOLDER}'`
      , `<style type="text/css">${css}</style>`,
    )

    expect(escaped).toContain('"\\\\200B"')
  })
})
