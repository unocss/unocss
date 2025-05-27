import type { UnocssSveltePreprocessOptions } from '../src/preprocess'
import presetIcons from '@unocss/preset-icons'
import presetTypography from '@unocss/preset-typography'
import presetWind3 from '@unocss/preset-wind3'

import fs from 'fs-extra'
import { format as prettier } from 'prettier'
// @ts-expect-error missing types
import prettierSvelte from 'prettier-plugin-svelte'
import { preprocess } from 'svelte/compiler'
import { describe, expect, it } from 'vitest'
import { GLOBAL_STYLES_PLACEHOLDER } from '../src/_vite/constants'
import { replaceGlobalStylesPlaceholder } from '../src/_vite/global'
import UnocssSveltePreprocess from '../src/preprocess'

const defaultOptions: UnocssSveltePreprocessOptions = {
  configOrPath: {
    safelist: ['mb-7px', 'uno-prose'],
    presets: [
      presetWind3(),
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

  const cases = import.meta.glob<string>('./cases/**/Input.svelte', { query: '?raw', import: 'default' })
  for (const [path, loadRaw] of Object.entries(cases)) {
    it(path.replace(/.\/cases\/(.+)\/Input.svelte/, '$1'), async () => {
      const dev = await preprocessSFC(await loadRaw(), path, { combine: false })
      await expect(dev).toMatchFileSnapshot(path.replace('Input.svelte', 'OutputDev.svelte'))
      const prod = await preprocessSFC(await loadRaw(), path)
      await expect(prod).toMatchFileSnapshot(path.replace('Input.svelte', 'OutputProd.svelte'))
    })
  }
})

describe('svelte-scoped helpers', () => {
  it('escape template literal characters in placeholder replacement', async () => {
    const css = await fs.readFile('packages-integrations/svelte-scoped/test/fixtures/escaped-unicode.css', 'utf8')

    const escaped = replaceGlobalStylesPlaceholder(
      `'${GLOBAL_STYLES_PLACEHOLDER}'`,
      `<style type="text/css">${css}</style>`,
    )

    expect(escaped).toContain('"\\\\200B"')
  })
})
