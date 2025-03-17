import type { Preset, UserConfig } from '@unocss/core'
import type { Theme } from '@unocss/preset-mini'
import { createGenerator, mergeConfigs, noop } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { describe, expect, it } from 'vitest'

describe('config', () => {
  const createUno = (userConfig: UserConfig) => {
    return createGenerator<Theme>({
      ...userConfig,
      presets: [
        presetMini(),
      ],
    })
  }
  it('theme', async () => {
    const uno = await createUno({
      theme: {
        colors: {
          red: {
            500: '#0f0',
          },
        },
      },
    })
    const { css } = await uno.generate('text-red-500 text-blue', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-blue{--un-text-opacity:1;color:rgb(96 165 250 / var(--un-text-opacity));}
      .text-red-500{--un-text-opacity:1;color:rgb(0 255 0 / var(--un-text-opacity));}"
    `)
  })

  it('extendTheme with return extend', async () => {
    const uno = await createUno({
      extendTheme(mergedTheme) {
        return {
          ...mergedTheme,
          colors: {
            red: {
              500: 'red',
            },
          },
        }
      },
    })
    expect(uno.config.theme.colors).toEqual({ red: { 500: 'red' } })
  })

  it('extendTheme with return', async () => {
    const unocss = await createGenerator<Theme>({
      extendTheme: () => {
        return {
          colors: {
            red: {
              200: 'red',
            },
          },
        }
      },
      presets: [
        presetMini(),
      ],
    })
    const { css } = await unocss.generate('text-red-100 text-red-200', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-red-200{color:red;}"
    `)
  })

  it('extendTheme with mutation', async () => {
    const unocss = await createGenerator<Theme>({
      extendTheme: (theme) => {
        // @ts-expect-error test
        theme.colors.red[100] = 'green'
        // @ts-expect-error test
        theme.colors.red[200] = 'red'
      },
      presets: [
        presetMini(),
      ],
    })
    const { css } = await unocss.generate('text-red-100 text-red-200', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: default */
      .text-red-100{color:green;}
      .text-red-200{color:red;}"
    `)
  })

  it('nested presets', async () => {
    const presetA: Preset = {
      name: 'presetA',
      rules: [
        ['text-red-500', { color: 'red' }],
        ['bg-red-500', { backgroundColor: 'red' }],
      ],
      shortcuts: {
        'text-red': 'text-red-500',
      },
    }
    const presetB: Preset = {
      name: 'presetB',
      rules: [
        ['text-yellow-500', { color: 'yellow' }],
        ['bg-yellow-500', { backgroundColor: 'yellow' }],
      ],
      shortcuts: [{
        btn: 'text-red bg-yellow-500',
      }],
      presets: [
        presetA,
      ],
    }

    const uno = await createGenerator({
      presets: [
        presetB,
      ],
    })

    expect(uno.config.presets.map(i => i.name))
      .toEqual(['presetB', 'presetA'])

    const { css } = await uno.generate('btn text-red text-yellow-500', { preflights: false })
    expect(css).toMatchInlineSnapshot(`
      "/* layer: shortcuts */
      .btn{backgroundColor:yellow;color:red;}
      .text-red{color:red;}
      /* layer: default */
      .text-yellow-500{color:yellow;}"
    `)
  })

  it('uniq presets', async () => {
    const presetA: Preset = { name: 'presetA' }
    const presetB: Preset = { name: 'presetB' }
    const presetC: Preset = { name: 'presetC', presets: [presetA] }

    const unoA = await createGenerator({
      presets: [
        presetA,
        presetB,
        presetA,
      ],
    })

    expect(unoA.config.presets.map(i => i.name)).toEqual(['presetA', 'presetB'])

    const unoB = await createGenerator({
      presets: [
        presetA,
        presetB,
        presetC,
      ],
    })

    expect(unoB.config.presets.map(i => i.name)).toEqual(['presetA', 'presetB', 'presetC'])
  })
})

describe('mergeConfigs', () => {
  it('basic', () => {
    expect(mergeConfigs([
      {
        shortcuts: {
          foo: 'string',
        },
      },
      {
        shortcuts: [
          {
            bar: 'string',
          },
          [/a/i, () => 'a'],
        ],
      },
    ]))
      .toMatchInlineSnapshot(`
        {
          "shortcuts": [
            {
              "foo": "string",
            },
            {
              "bar": "string",
            },
            [
              /a/i,
              [Function],
            ],
          ],
        }
      `)
  })

  it('theme', () => {
    expect(mergeConfigs([
      {
        theme: {
          fontSize: {
            sm: ['0.875rem', '1.125rem'],
            md: ['1.125rem', '1.5rem'],
            lg: ['1.25rem', '1.5rem'],
          },
        },
      },
      {
        theme: {
          fontSize: {
            sm: ['1rem', '1.125rem'],
            xl: ['1.5rem', '1.75rem'],
          },
        },
      },
    ]))
      .toMatchInlineSnapshot(`
        {
          "theme": {
            "fontSize": {
              "lg": [
                "1.25rem",
                "1.5rem",
              ],
              "md": [
                "1.125rem",
                "1.5rem",
              ],
              "sm": [
                "1rem",
                "1.125rem",
              ],
              "xl": [
                "1.5rem",
                "1.75rem",
              ],
            },
          },
        }
      `)
  })

  it('content.pipeline', () => {
    expect(mergeConfigs([
      {
        content: {
          pipeline: { include: 'string' },
        },
      },
      {
        content: {
          pipeline: { include: /regex/ },
        },
      },
      {
        content: {
          pipeline: { include: ['array1'] },
        },
      },
      {
        content: {
          pipeline: { include: ['array2'] },
        },
      },
    ]))
      .toMatchInlineSnapshot(`
        {
          "content": {
            "pipeline": {
              "exclude": [],
              "include": [
                "string",
                /regex/,
                "array1",
                "array2",
              ],
            },
          },
        }
      `)

    expect(mergeConfigs([
      {
        content: {
          pipeline: { include: 'string' },
        },
      },
      {
        content: {
          pipeline: { exclude: /regex/ },
        },
      },
      {
        content: {
          pipeline: false,
        },
      },
    ]))
      .toMatchInlineSnapshot(`
        {
          "content": {
            "pipeline": false,
          },
        }
      `)
  })

  it('content', async () => {
    const uno = await createGenerator({
      presets: [{
        name: 'test',
        content: {
          filesystem: ['foo/bar.css'],
          inline: ['bg-blue-1'],
        },
      }],
      content: {
        filesystem: ['foo.js'],
      },
    })

    expect(uno.config.content).toMatchObject({
      filesystem: ['foo/bar.css', 'foo.js'],
      inline: ['bg-blue-1'],
    })
  })

  it('merge transformers', async () => {
    const uno = await createGenerator({
      presets: [
        {
          name: 'preset-foo',
          transformers: [
            {
              name: 'transformer-foo',
              transform: noop,
            },
            {
              name: 'transformer-bar',
              transform: noop,
            },
          ],
        },
      ],
      transformers: [
        {
          name: 'transformer-bar',
          transform: noop,
        },
      ],
    })

    expect(uno.config.transformers?.map(i => i.name)).toEqual(['transformer-foo', 'transformer-bar'])
  })

  it('onConfig', async () => {
    let count = 0

    const uno = await createGenerator({
      presets: [
        {
          name: 'preset-foo',
          rules: [[
            /^foo$/,
            () => {
              count++
              return { color: 'red' }
            },
          ]],
          onConfig() {
            count = 0
          },
        },
        {
          name: 'preset-bar',
          rules: [[
            /^bar$/,
            () => {
              count = count * 2
              return { color: 'red' }
            },
          ]],
          onConfig() {
            count = 1 // Has higher priority
          },
        },
      ],
    })

    expect(count).toBe(1)
    await uno.generate('foo')
    expect(count).toBe(2)
    await uno.generate('bar')
    expect(count).toBe(4)

    // Set config
    await uno.setConfig({
      presets: [
        {
          name: 'preset-baz',
          rules: [[
            /^baz$/,
            () => {
              count++
              return { color: 'red' }
            },
          ]],
          onConfig() {
            count = -1
          },
        },
      ],
    })

    expect(count).toBe(-1)
    await uno.generate('baz')
    expect(count).toBe(0)
  })
})
