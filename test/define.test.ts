import { createGenerator, definePreset } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('definePreset', () => {
  it('functional', async () => {
    const presetFun = definePreset(() => {
      return {
        name: 'custom-preset-functional',
        rules: [
          ['text-fun', {
            color: 'red',
          }],
        ],
      }
    })

    const presetStatic = definePreset({
      name: 'custom-preset-static',
      rules: [
        ['text-static', {
          color: 'blue',
        }],
      ],
    })

    const presetOptional = definePreset((option: { color?: string } = {}) => {
      const color = option.color ?? 'red'
      return {
        name: 'custom-preset',
        rules: [
          ['text-option', {
            color,
          }],
        ],
      }
    })

    const uno = createGenerator({
      presets: [
        presetFun(),
        presetStatic(),
        presetOptional({
          color: 'dark',
        }),
      ],
    })

    const { css } = await uno.generate('text-fun text-static text-option', {
      minify: true,
    })
    expect(css).toMatchInlineSnapshot('".text-fun{color:red;}.text-static{color:blue;}.text-option{color:dark;}"')
  })
})
