import { createGenerator, escapeSelector } from '@unocss/core'
import presetWind4 from '@unocss/preset-wind4'
import { describe, expect, it } from 'vitest'

describe('preset-wind4 containment', () => {
  it.each([
    ['size', 'size'],
    ['inline-size', 'size'],
    ['layout', 'layout'],
    ['paint', 'paint'],
    ['style', 'style'],
  ])('generates composable contain-%s', async (value, slot) => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    const { css } = await uno.generate(`contain-${value}`, { preflights: false })

    expect(css).toContain(`.contain-${value}{--un-contain-${slot}:${value};contain:var(--un-contain-size, ) var(--un-contain-layout, ) var(--un-contain-paint, ) var(--un-contain-style, );}`)
  })

  it.each([
    ['none', 'none'],
    ['strict', 'strict'],
    ['content', 'content'],
    ['[paint]', 'paint'],
    ['[layout_paint]', 'layout paint'],
  ])('preserves contain-%s', async (value, expected) => {
    const uno = await createGenerator({ presets: [presetWind4()] })
    const { css } = await uno.generate(`contain-${value}`, { preflights: false })

    expect(css).toContain(`.${escapeSelector(`contain-${value}`)}{contain:${expected};}`)
  })

  it('composes containment in shortcuts with a custom variable prefix', async () => {
    const uno = await createGenerator({
      presets: [presetWind4({ variablePrefix: 'foo-' })],
      shortcuts: { contained: 'contain-inline-size contain-layout contain-paint contain-style' },
    })
    const { css } = await uno.generate('contained')

    for (const [slot, value] of [['size', 'inline-size'], ['layout', 'layout'], ['paint', 'paint'], ['style', 'style']]) {
      expect(css).toContain(`--foo-contain-${slot}:${value};`)
      expect(css).toContain(`@property --foo-contain-${slot}{syntax:"*";inherits:false;}`)
    }
    expect(css).toContain('contain:var(--foo-contain-size, ) var(--foo-contain-layout, ) var(--foo-contain-paint, ) var(--foo-contain-style, );')
  })
})
