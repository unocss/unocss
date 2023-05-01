import { describe, expect, it } from 'vitest'
import { preprocess } from 'svelte/compiler'
import { format as prettier } from 'prettier'
import prettierSvelte from 'prettier-plugin-svelte'
import presetUno from '@unocss/preset-uno'
import presetIcons from '@unocss/preset-icons'
import UnocssSveltePreprocess from '../src'
import type { UnocssSveltePreprocessOptions } from '../src/types'

const defaultOptions: UnocssSveltePreprocessOptions = {
  configOrPath: {
    // shortcuts: [
    //   { logo: 'i-logos:svelte-icon w-7em h-7em transform transition-300' },
    // ],
    presets: [
      presetUno(),
      presetIcons({
        prefix: 'i-',
        extraProperties: {
          'display': 'inline-block',
          'vertical-align': 'middle',
        },
      }),
    ],
  },
}

describe('svelte-preprocessor cases', () => {
  const cases = import.meta.glob('./cases/**/Input.svelte', { as: 'raw' })

  async function preprocessSFC(code: string, path: string, options: UnocssSveltePreprocessOptions = {}): Promise<string> {
    options = { ...defaultOptions, ...options }
    const result = await preprocess(code, [UnocssSveltePreprocess(options)], { filename: path })
    return prettier(result.code, {
      parser: 'svelte',
      plugins: [prettierSvelte],
    })
  }

  for (const [path, loadRaw] of Object.entries(cases)) {
    it(path, async () => {
      const dev = await preprocessSFC(await loadRaw(), path, { combine: false })
      expect(dev).toMatchFileSnapshot(path.replace('Input.svelte', 'OutputDev.svelte'))
      const prod = await preprocessSFC(await loadRaw(), path)
      expect(prod).toMatchFileSnapshot(path.replace('Input.svelte', 'OutputProd.svelte'))
    })
  }
})
