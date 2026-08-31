import { createGenerator } from '@unocss/core'
import { describe, expect, it } from 'vitest'
import { presetWind4 } from '../../../packages-presets/preset-wind4'
import { getPrettiedMarkdown } from '../src/utils/css'

describe('getPrettiedMarkdown', () => {
  it('shows a resolved default theme value while preserving the generated declaration', async () => {
    const uno = await createGenerator({
      presets: [presetWind4({ preflights: { reset: false } })],
    })

    await expect(getPrettiedMarkdown(uno, 'p-4', -1)).resolves.toContain(`.p-4 {
  padding: calc(var(--spacing) * 4); /* 1rem */
}`)
  })

  it('uses the current custom theme value', async () => {
    const uno = await createGenerator({
      presets: [presetWind4({ preflights: { reset: false } })],
      theme: {
        spacing: { DEFAULT: '0.5rem' },
      },
    })

    await expect(getPrettiedMarkdown(uno, 'p-4', -1)).resolves.toContain(`.p-4 {
  padding: calc(var(--spacing) * 4); /* 2rem */
}`)
  })

  it('does not show a resolved value when the theme cannot resolve it', async () => {
    const uno = await createGenerator({
      rules: [
        ['p-4', { padding: 'var(--spacing)' }],
      ],
    })

    await expect(getPrettiedMarkdown(uno, 'p-4', -1)).resolves.toContain(`.p-4 {
  padding: var(--spacing);
}`)
  })
})
