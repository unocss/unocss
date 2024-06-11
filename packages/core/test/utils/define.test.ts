import { createGenerator, definePreset } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('definePreset', () => {
  it('functional', async () => {
    const presetFn1 = definePreset(() => {
      return {
        name: 'custom-preset-functional-1',
        rules: [
          ['text-fn1', {
            color: 'red',
          }],
        ],
      }
    })

    const presetFn2 = definePreset(() => {
      return {
        name: 'custom-preset-functional-2',
        rules: [
          ['text-fn2', {
            color: 'green',
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
        presetFn1(),
        presetFn2, // presetFn2 is a factory that will be evaluated by uno
        presetStatic,
        presetOptional({
          color: 'dark',
        }),
      ],
    })

    const { css } = await uno.generate('text-fn1 text-fn2 text-static text-option')
    expect(css)
      .toMatchInlineSnapshot(`
        "/* layer: default */
        .text-fn1{color:red;}
        .text-fn2{color:green;}
        .text-static{color:blue;}
        .text-option{color:dark;}"
      `)
  })
})
