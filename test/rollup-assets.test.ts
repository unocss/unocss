import type { Plugin } from 'rollup'
import UnoCSS from '@unocss/rollup'
import { rolldown } from 'rolldown'
import { rollup } from 'rollup'
import { describe, expect, it } from 'vitest'

function entryPlugin(): Plugin {
  return {
    name: 'entry',
    resolveId(id) {
      if (id === 'entry')
        return '/entry.tsx'
    },
    load(id) {
      if (id === '/entry.tsx')
        return 'import \'uno.css\'\nexport const className = \'text-red-500\''
    },
  }
}

async function getUnoCss(bundle: { generate: (options: { format: 'es' }) => Promise<{ output: Array<{ type: string, source?: unknown }> }> }) {
  const output = await bundle.generate({ format: 'es' })
  const asset = output.output.find(item => item.type === 'asset')

  expect(asset?.source).toContain('.text-red-500')
}

describe('rollup-compatible plugin', () => {
  it('emits UnoCSS with Rollup', async () => {
    const bundle = await rollup({
      input: 'entry',
      plugins: [
        entryPlugin(),
        UnoCSS({ rules: [['text-red-500', { color: 'red' }]] }),
      ],
    })

    await getUnoCss(bundle)
  })

  it('emits UnoCSS with Rolldown', async () => {
    const bundle = await rolldown({
      input: 'entry',
      plugins: [
        entryPlugin(),
        UnoCSS({ rules: [['text-red-500', { color: 'red' }]] }),
      ],
    })

    await getUnoCss(bundle)
  })
})
