import type { RuleContext } from '@unocss/core'
import { createGenerator, symbols } from '@unocss/core'
import { colorResolver, colorableShadows } from '@unocss/preset-mini/utils'

import { describe, expect, it } from 'vitest'

describe('preset-mini color utils', () => {
  it('parses shadow color values', () => {
    // default 'none'
    expect(colorableShadows('0 0 #0000', '--v')).eql(['0 0 var(--v, rgb(0 0 0 / 0))'])

    // with spaces
    expect(colorableShadows('0 1px 3px 0 rgba(0, 0, 0, 0.2)', '--v')).eql(['0 1px 3px 0 var(--v, rgba(0, 0, 0, 0.2))'])

    // full box-shadow
    expect(colorableShadows('var(--un-shadow-inset) 0 1px 3px 0 #0000', '--v')).eql(['var(--un-shadow-inset) 0 1px 3px 0 var(--v, rgb(0 0 0 / 0))'])

    // no color
    expect(colorableShadows('0', '--v')).eql(['0'])
    expect(colorableShadows('1px 2px', '--v')).eql(['1px 2px'])

    // text shadow alternative syntax (color first)
    expect(colorableShadows('#0000 0 0', '--v')).eql(['0 0 var(--v, rgb(0 0 0 / 0))'])

    // component length
    expect(colorableShadows('1px #200', '--v')).eql(['1px #200'])
    expect(colorableShadows('inset 2px 3px 4px 5px #600', '--v')).eql(['inset 2px 3px 4px 5px var(--v, rgb(102 0 0))'])
    expect(colorableShadows('inset 2px 3px 4px 5px 6px #700', '--v')).eql(['inset 2px 3px 4px 5px 6px #700'])

    // optional keyword "inset" and color value order
    expect(colorableShadows('1px 0 0 0 #000', '--v')).eql(['1px 0 0 0 var(--v, rgb(0 0 0))'])
    expect(colorableShadows('#000 inset 1px 0 0 0', '--v')).eql(['inset 1px 0 0 0 var(--v, rgb(0 0 0))'])
    expect(colorableShadows('inset #000 1px 0 0 0', '--v')).eql(['inset 1px 0 0 0 var(--v, rgb(0 0 0))'])
    expect(colorableShadows('inset 1px 0 0 0 #000', '--v')).eql(['inset 1px 0 0 0 var(--v, rgb(0 0 0))'])
    expect(colorableShadows('#000 1px 0 0 0 inset', '--v')).eql(['inset 1px 0 0 0 var(--v, rgb(0 0 0))'])
    expect(colorableShadows('1px 0 0 0 #000 inset', '--v')).eql(['inset 1px 0 0 0 var(--v, rgb(0 0 0))'])
    expect(colorableShadows('1px 0 0 0 inset #000', '--v')).eql(['inset 1px 0 0 0 var(--v, rgb(0 0 0))'])

    // invalid
  })

  it('parses color token', () => {
    const context: RuleContext = {
      theme: {
        colors: {
          info: 'hsl(200.1,100%,54.3%)',
          warning: 'hsl(42.4 100% 50%)',
          danger: 'hsl(var(--danger))',
        },
      },
      symbols,
      rawSelector: '',
      currentSelector: '',
      generator: createGenerator(),
      variantHandlers: [],
      variantMatch: ['', '', [], new Set()],
      constructCSS: () => '',
    }

    const fn = (body: string) => colorResolver('prop', 'v')(['', body], context)

    expect(fn('info')).eql({
      '--un-v-opacity': 1,
      'prop': 'hsl(200.1 100% 54.3% / var(--un-v-opacity))',
    })

    expect(fn('info/10')).eql({
      prop: 'hsl(200.1 100% 54.3% / 0.1)',
    })

    expect(fn('warning')).eql({
      '--un-v-opacity': 1,
      'prop': 'hsl(42.4 100% 50% / var(--un-v-opacity))',
    })

    expect(fn('warning/[20%]')).eql({
      prop: 'hsl(42.4 100% 50% / 20%)',
    })

    expect(fn('danger')).eql({
      '--un-v-opacity': 1,
      'prop': 'hsl(var(--danger) / var(--un-v-opacity))',
    })

    expect(fn('danger/$o3')).eql({
      prop: 'hsl(var(--danger) / var(--o3))',
    })

    expect(fn('hex-fff')).eql({
      '--un-v-opacity': 1,
      'prop': 'rgb(255 255 255 / var(--un-v-opacity))',
    })

    expect(fn('hex-fff/10')).eql({
      prop: 'rgb(255 255 255 / 0.1)',
    })

    expect(fn('$abc')).eql({
      prop: 'var(--abc)',
    })

    expect(fn('#0000')).eql({
      '--un-v-opacity': 0,
      'prop': 'rgb(0 0 0 / var(--un-v-opacity))',
    })

    // invalid
    expect(fn('hex-invalid')).eql({})
    expect(fn('5px')).eql(undefined)
    expect(fn('5rem')).eql(undefined)
    expect(fn('#fff f')).eql({})
    expect(fn('hex-fff f')).eql({})
  })
})
