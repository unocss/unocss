import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { variantBreakpoints as miniVariantBreakpoints } from '@unocss/preset-mini/variants'
import presetWind3 from '@unocss/preset-wind3'
import presetWind4 from '@unocss/preset-wind4'
import { variantBreakpoints as wind4VariantBreakpoints } from '@unocss/preset-wind4/variants'
import { resolveScreenMediaQuery } from '@unocss/rule-utils'
import { describe, expect, it } from 'vitest'

const theme = {
  breakpoints: { sm: '640px', onlyWind3: '800px' },
  breakpoint: { sm: '40rem', onlyWind4: '50rem' },
  verticalBreakpoints: { sm: '480px' },
  verticalBreakpoint: { sm: '30rem' },
  container: { padding: { sm: '10px', onlyWind3: '20px' } },
  containers: { padding: { sm: '1rem', onlyWind4: '2rem' } },
}

const presets = [
  { name: 'mini', preset: presetMini, width: '640px', height: '480px', key: 'breakpoints' },
  { name: 'wind3', preset: presetWind3, width: '640px', height: '480px', key: 'breakpoints' },
  { name: 'wind4', preset: presetWind4, width: '40rem', height: '30rem', key: 'breakpoint' },
] as const

describe.each(presets)('$name breakpoint resolution', ({ preset, width, height, key }) => {
  it('uses its own keys for variants and screen sizes in a mixed theme', async () => {
    const uno = await createGenerator<object>({ presets: [preset()], theme })
    const { css } = await uno.generate('sm:block w-screen-sm h-screen-sm', { preflights: false })
    expect(css).toContain(`@media (min-width: ${width})`)
    expect(css).toContain(`width:${width}`)
    expect(css).toContain(`height:${height}`)
    expect(resolveScreenMediaQuery(uno.config.theme, 'sm')).toBe('(min-width: 40rem)')
  })

  it.each(['variant-first', 'screen-first'])('keeps screen and variant resolution separate: %s', async (order) => {
    const uno = await createGenerator<object>({ presets: [preset()], theme: { [key]: { sm: width } } })
    const expectedScreenQuery = resolveScreenMediaQuery(structuredClone(uno.config.theme), 'md')
    const checkScreen = () => expect(resolveScreenMediaQuery(uno.config.theme, 'md')).toBe(expectedScreenQuery)
    const checkVariants = async () => {
      const { matched } = await uno.generate('sm:block md:block', { preflights: false })
      expect(matched.has('sm:block')).toBe(true)
      expect(matched.has('md:block')).toBe(false)
    }
    if (order === 'variant-first') {
      await checkVariants()
      checkScreen()
    }
    else {
      checkScreen()
      await checkVariants()
    }
  })
})

describe('variantBreakpoints subpath exports', () => {
  it('binds each preset to its own theme key', () => {
    expect(miniVariantBreakpoints().autocomplete).toBe('(at-|lt-|max-|)$breakpoints:')
    expect(wind4VariantBreakpoints().autocomplete).toBe('(at-|lt-|max-|)$breakpoint:')
  })
})

it.each([
  { preset: presetWind3, name: 'wind3', width: '640px', padding: '10px', ownPoint: 'onlyWind3', otherPoint: 'onlyWind4' },
  { preset: presetWind4, name: 'wind4', width: '40rem', padding: '1rem', ownPoint: 'onlyWind4', otherPoint: 'onlyWind3' },
])('$name container rules use their own breakpoint key', async ({ preset, width, padding, ownPoint, otherPoint }) => {
  const uno = await createGenerator<object>({ presets: [preset()], theme })
  const { css, matched } = await uno.generate(`sm:container ${ownPoint}:container ${otherPoint}:container`, { preflights: false })
  expect(css).toContain(`@media (min-width: ${width})`)
  expect(css).toContain(`max-width:${width}`)
  expect(css).toContain(`padding-left:${padding}`)
  expect(matched.has(`${ownPoint}:container`)).toBe(true)
  expect(matched.has(`${otherPoint}:container`)).toBe(false)
})
