import type { RuleContext } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { colorResolver, colorToString, colorableShadows, hex2rgba, parseCssColor } from '@unocss/preset-mini/utils'
import { describe, expect, it } from 'vitest'

describe('color utils', () => {
  it('convert hex to rgb', () => {
    expect(hex2rgba('#fff')).eql([255, 255, 255])
    expect(hex2rgba('fff')).eql(undefined)
    expect(hex2rgba('#000')).eql([0, 0, 0])
    expect(hex2rgba('#264512')).eql([38, 69, 18])
    expect(hex2rgba('#123')).eql([17, 34, 51])
    expect(hex2rgba('#abd3')).eql([170, 187, 221, 0.2])
    expect(hex2rgba('#95723489')).eql([149, 114, 52, 0.54])
    expect(hex2rgba('95723489')).eql(undefined)
    expect(hex2rgba('#12')).eql(undefined)
    expect(hex2rgba('#12123')).eql(undefined)
  })

  it('parses css colors', () => {
    expect(parseCssColor('rgb(0,1,2)')).eql({ type: 'rgb', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('rgba(0,1,2,3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0,(1),2,3)')).eql({ type: 'rgba', components: ['0', '(1)', '2'], alpha: '3' })
    expect(parseCssColor('rgb(0)')).eql({ type: 'rgb', components: ['0'], alpha: undefined })
    expect(parseCssColor('rgb(0,1)')).eql(undefined)
    expect(parseCssColor('rgba(0,1,2)')).eql(undefined)
    expect(parseCssColor('rgba(0,1,2,3,4)')).eql(undefined)
    expect(parseCssColor('rgba(0,)1(,2,3)')).eql(undefined)

    expect(parseCssColor('rgba(0 1 2 / 3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2/ 3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2 /3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2/3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2//3)')).eql(undefined)
    expect(parseCssColor('rgb(0)')).eql({ type: 'rgb', components: ['0'], alpha: undefined })
    expect(parseCssColor('rgba(0 / 1)')).eql({ type: 'rgba', components: ['0'], alpha: '1' })
    expect(parseCssColor('rgba(0 1)')).eql(undefined)
    expect(parseCssColor('rgba(0 1 / 2)')).eql(undefined)
    expect(parseCssColor('rgb(0 1 2)')).eql({ type: 'rgb', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('rgba(0 1 2)')).eql(undefined)
    expect(parseCssColor('rgba(0 1 2 3)')).eql(undefined)
    expect(parseCssColor('rgba(0 1 2 3 4)')).eql(undefined)

    expect(parseCssColor('color(rgb 0 1 2)')).eql({ type: 'rgb', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('color(rgba 0 1 2)')).eql(undefined)
    expect(parseCssColor('color(rgba 0 1 2 / 3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })

    expect(parseCssColor('color(fancy 0 1 2 3 4 5 / 6)')).eql({ type: 'fancy', components: ['0', '1', '2', '3', '4', '5'], alpha: '6' })
    expect(parseCssColor('color(fancy 0 1 2 3 4 5 /6)')).eql({ type: 'fancy', components: ['0', '1', '2', '3', '4', '5'], alpha: '6' })
    expect(parseCssColor('color(fancy 0 1 2 3 4 5/ 6)')).eql({ type: 'fancy', components: ['0', '1', '2', '3', '4', '5'], alpha: '6' })
    expect(parseCssColor('color(fancy 0 1 2 3 4 5/6)')).eql({ type: 'fancy', components: ['0', '1', '2', '3', '4', '5'], alpha: '6' })
    expect(parseCssColor('color(fancy 0 1 2 3 4 5//6)')).eql(undefined)

    expect(parseCssColor('color(over-limit 2 3 4 5 6 7 8 9 10)')).eql({ type: 'over-limit', components: ['2', '3', '4', '5', '6', '7', '8', '9', '10'], alpha: undefined })
    expect(parseCssColor('color(over-limit 2 3 4 5 6 7 8 / 9)')).eql({ type: 'over-limit', components: ['2', '3', '4', '5', '6', '7', '8'], alpha: '9' })
    expect(parseCssColor('color(over-limit 2 3 4 5 6 7 8 9 10 11)')).eql(undefined)
    expect(parseCssColor('color(over-limit 2 3 4 5 6 7 8 9 / 10)')).eql(undefined)

    expect(parseCssColor('color(lite 0)')).eql({ type: 'lite', components: ['0'], alpha: undefined })
    expect(parseCssColor('color(lite 0 / 1)')).eql({ type: 'lite', components: ['0'], alpha: '1' })
    expect(parseCssColor('color(lite 0 /1)')).eql({ type: 'lite', components: ['0'], alpha: '1' })
    expect(parseCssColor('color(lite 0/ 1)')).eql({ type: 'lite', components: ['0'], alpha: '1' })
    expect(parseCssColor('color(lite 0/1)')).eql({ type: 'lite', components: ['0'], alpha: '1' })
    expect(parseCssColor('color(lite)')).eql(undefined)
    expect(parseCssColor('color(lite 0//1)')).eql(undefined)

    expect(parseCssColor('color(vary calc(0.1 / 5) calc(0.2 / 5) / calc(0.3 / 5))')).eql({ type: 'vary', components: ['calc(0.1 / 5)', 'calc(0.2 / 5)'], alpha: 'calc(0.3 / 5)' })
    expect(parseCssColor('color(vary calc(0.1 / 5) calc(0.2 / 5) /calc(0.3 / 5))')).eql({ type: 'vary', components: ['calc(0.1 / 5)', 'calc(0.2 / 5)'], alpha: 'calc(0.3 / 5)' })
    expect(parseCssColor('color(vary calc(0.1 / 5) calc(0.2 / 5)/ calc(0.3 / 5))')).eql({ type: 'vary', components: ['calc(0.1 / 5)', 'calc(0.2 / 5)'], alpha: 'calc(0.3 / 5)' })
    expect(parseCssColor('color(vary calc(0.1 / 5) calc(0.2 / 5)/calc(0.3 / 5))')).eql({ type: 'vary', components: ['calc(0.1 / 5)', 'calc(0.2 / 5)'], alpha: 'calc(0.3 / 5)' })
    expect(parseCssColor('color(vary calc(0.1 / 5) calc(0.2 / 5)//calc(0.3 / 5))')).eql(undefined)
  })

  it('generate css color string', () => {
    const fn = (x: string) => colorToString(parseCssColor(x)!)

    expect(fn('rgb(0,1,2)')).eql('rgba(0,1,2)')
    expect(fn('rgba(0,1,2,3)')).eql('rgba(0,1,2,3)')
    expect(fn('rgba(0,(1),2,3)')).eql('rgba(0,(1),2,3)')

    expect(fn('rgba(0 1 2 / 3)')).eql('rgba(0,1,2,3)')
    expect(fn('rgba(0 1 2/ 3)')).eql('rgba(0,1,2,3)')
    expect(fn('rgba(0 1 2 /3)')).eql('rgba(0,1,2,3)')
    expect(fn('rgba(0 1 2/3)')).eql('rgba(0,1,2,3)')

    expect(fn('color(rgba 0 1 2 / 3)')).eql('rgba(0,1,2,3)')
    expect(fn('color(fancy 0 1 2 3 4 5 / 6)')).eql('color(fancy 0 1 2 3 4 5 / 6)')
    expect(fn('color(fancy 0 1 2 3 4 5 /6)')).eql('color(fancy 0 1 2 3 4 5 / 6)')
    expect(fn('color(fancy 0 1 2 3 4 5/ 6)')).eql('color(fancy 0 1 2 3 4 5 / 6)')
    expect(fn('color(fancy 0 1 2 3 4 5/6)')).eql('color(fancy 0 1 2 3 4 5 / 6)')

    expect(fn('color(lite 0)')).eql('color(lite 0)')
    expect(fn('color(lite 0 / 1)')).eql('color(lite 0 / 1)')
    expect(fn('color(lite 0 /1)')).eql('color(lite 0 / 1)')
    expect(fn('color(lite 0/ 1)')).eql('color(lite 0 / 1)')
    expect(fn('color(lite 0/1)')).eql('color(lite 0 / 1)')

    expect(fn('color(vary calc(0.1 / 5) calc(0.2 / 5) / calc(0.3 / 5))')).eql('color(vary calc(0.1 / 5) calc(0.2 / 5) / calc(0.3 / 5))')
    expect(fn('color(vary calc(0.1 / 5) calc(0.2 / 5) /calc(0.3 / 5))')).eql('color(vary calc(0.1 / 5) calc(0.2 / 5) / calc(0.3 / 5))')
    expect(fn('color(vary calc(0.1 / 5) calc(0.2 / 5)/ calc(0.3 / 5))')).eql('color(vary calc(0.1 / 5) calc(0.2 / 5) / calc(0.3 / 5))')
    expect(fn('color(vary calc(0.1 / 5) calc(0.2 / 5)/calc(0.3 / 5))')).eql('color(vary calc(0.1 / 5) calc(0.2 / 5) / calc(0.3 / 5))')
  })

  it('parses shadow color values', () => {
    // default 'none'
    expect(colorableShadows('0 0 #0000', '--v')).eql(['0 0 var(--v, rgba(0,0,0,0))'])

    // with spaces
    expect(colorableShadows('0 1px 3px 0 rgba(0, 0, 0, 0.2)', '--v')).eql(['0 1px 3px 0 var(--v, rgba(0,0,0,0.2))'])

    // full box-shadow
    expect(colorableShadows('var(--un-shadow-inset) 0 1px 3px 0 #0000', '--v')).eql(['var(--un-shadow-inset) 0 1px 3px 0 var(--v, rgba(0,0,0,0))'])

    // no color
    expect(colorableShadows('0', '--v')).eql(['0'])
    expect(colorableShadows('1px 2px', '--v')).eql(['1px 2px'])

    // text shadow alternative syntax (color first, unsupported/not parsed)
    expect(colorableShadows('#0000 0 0', '--v')).eql(['#0000 0 0'])

    // component length
    expect(colorableShadows('1px #200', '--v')).eql(['1px #200'])
    expect(colorableShadows('inset 2px 3px 4px 5px #600', '--v')).eql(['inset 2px 3px 4px 5px var(--v, rgba(102,0,0))'])
    expect(colorableShadows('inset 2px 3px 4px 5px 6px #700', '--v')).eql(['inset 2px 3px 4px 5px 6px #700'])
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
      rawSelector: '',
      currentSelector: '',
      generator: createGenerator(),
      variantHandlers: [],
      variantMatch: ['', '', []],
      constructCSS: () => '',
    }

    const fn = (body: string) => colorResolver('prop', 'v')(['', body], context)

    expect(fn('info')).eql({
      '--un-v-opacity': 1,
      'prop': 'hsla(200.1,100%,54.3%,var(--un-v-opacity))',
    })

    expect(fn('info/10')).eql({
      prop: 'hsla(200.1,100%,54.3%,0.1)',
    })

    expect(fn('warning')).eql({
      '--un-v-opacity': 1,
      'prop': 'hsla(42.4,100%,50%,var(--un-v-opacity))',
    })

    expect(fn('warning/[20%]')).eql({
      prop: 'hsla(42.4,100%,50%,20%)',
    })

    expect(fn('danger')).eql({
      '--un-v-opacity': 1,
      'prop': 'hsla(var(--danger),var(--un-v-opacity))',
    })

    expect(fn('danger/$o3')).eql({
      prop: 'hsla(var(--danger),var(--o3))',
    })
  })
})
