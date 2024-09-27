import { createGenerator } from '@unocss/core'
import presetUno from '@unocss/preset-uno'
import { describe, expect, it } from 'vitest'
import { transformStyle } from './transformStyle'

describe('transformStyle transforms theme with useThemeFn true', () => {
  const uno = createGenerator({
    presets: [
      presetUno({
        theme: {
          colors: {
            blue: {
              500: '#3b82f6',
            },
          },
        },
      }),
    ],
  })

  async function transform(content: string) {
    const transformed = await transformStyle({ content, uno, filename: 'test.css', prepend: '', applyVariables: [], hasThemeFn: true, useThemeFn: true })
    return transformed?.code
  }

  it('handles theme()', async () => {
    const style = `.custom-class {
  @apply bg-[theme('colors.blue.500')];
}`
    expect(await transform(style)).toMatchInlineSnapshot(`
      ".custom-class {
        @apply bg-[#3b82f6];
      }"
    `)
  })
})

describe('????transformStyle transforms theme with useThemeFn true', () => {
  const uno = createGenerator({
    presets: [
      presetUno({
        theme: {
          colors: {
            blue: {
              500: '#3b82f6',
            },
          },
        },
      }),
    ],
  })

  async function transform(content: string) {
    const transformed = await transformStyle({ content, uno, filename: 'test.css', prepend: '', applyVariables: ['at-apply'], hasThemeFn: true, useThemeFn: true })
    return transformed?.code
  }

  it('handles theme()', async () => {
    const style = `.custom-class {
  @apply bg-[theme('colors.blue.500')];
}`
    expect(await transform(style)).toMatchInlineSnapshot(`
      ".custom-class {
        background-color: #3b82f6;
      }"
    `)
  })
})

describe('transformStyle does not transform theme with useThemeFn false', () => {
  const uno = createGenerator({
    presets: [
      presetUno({
        theme: {
          colors: {
            blue: {
              500: '#3b82f6',
            },
          },
        },
      }),
    ],
  })

  async function transform(content: string) {
    const transformed = await transformStyle({ content, uno, filename: 'test.css', prepend: '', applyVariables: [], hasThemeFn: true, useThemeFn: false })
    return transformed?.code
  }

  it('returns undefined since the string did not change', async () => {
    const style = `.custom-class {
  @apply bg-[theme('colors.blue.500')];
}`
    expect(await transform(style)).toBe(undefined)
  })
})
