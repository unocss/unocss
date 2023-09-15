import { createGenerator, definePreset, functional } from '@unocss/core'
import { describe, expect, it } from 'vitest'

describe('definePreset', () => {
  it('test functional utils', () => {
    const fn1 = functional({
      a: 'a',
      b: 'b',
    })
    expect(fn1().a).toEqual(fn1.a)
    const fn2 = functional(p => ({
      a: p,
    }), 1)
    expect(fn2(2)).not.toEqual({ a: 1 })

    let sideEffect = false
    const fn = functional(() => {
      sideEffect = true
      return {
        a: 'a',
      }
    })
    expect(sideEffect).toBe(false)
    expect(fn.a).toEqual('a')
    expect(sideEffect).toBe(true)
  })

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

    const uno = createGenerator({
      presets: [
        presetFun(),
        presetStatic(),
      ],
    })

    const { css } = await uno.generate('text-fun text-static', {
      minify: true,
    })
    expect(css).toMatchInlineSnapshot('".text-fun{color:red;}.text-static{color:blue;}"')
  })

  it('static', async () => {
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

    const uno = createGenerator({
      presets: [
        presetFun,
        presetStatic,
      ],
    })

    const { css } = await uno.generate('text-fun text-static', {
      minify: true,
    })
    expect(css).toMatchInlineSnapshot('".text-fun{color:red;}.text-static{color:blue;}"')
  })

  it('static', async () => {
    const preset = definePreset({
      name: 'custom-preset',
      rules: [
        ['text-red', {
          color: 'red',
        }],
      ],
    })
    const uno = createGenerator({
      presets: [
        preset,
      ],
    })

    const { css } = await uno.generate('text-red', {
      minify: true,
    })
    expect(css).toMatchInlineSnapshot('".text-red{color:red;}"')
  })

  it('set options', async () => {
    const preset = definePreset((option) => {
      return {
        name: 'custom-preset',
        rules: [
          ['text-option', {
            color: option.color,
          }],
        ],
      }
    }, {
      color: 'dark',
    })
    const uno = createGenerator({
      presets: [
        preset,
      ],
    })

    const { css } = await uno.generate('text-option', {
      minify: true,
    })
    expect(css).toMatchInlineSnapshot('".text-option{color:dark;}"')
  })
})
