import { colorToString, hex2rgba, parseCssColor } from '@unocss/rule-utils'

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
    expect(parseCssColor('rgba(0,1,2)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('rgba(0,1,2,3,4)')).eql(undefined)
    expect(parseCssColor('rgba(0,)1(,2,3)')).eql(undefined)

    expect(parseCssColor('rgba(0 1 2 / 3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2/ 3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2 /3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2/3)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: '3' })
    expect(parseCssColor('rgba(0 1 2//3)')).eql(undefined)
    expect(parseCssColor('rgba(0 1 2/ /3)')).eql(undefined)
    expect(parseCssColor('rgb(0)')).eql({ type: 'rgb', components: ['0'], alpha: undefined })
    expect(parseCssColor('rgba(0 / 1)')).eql({ type: 'rgba', components: ['0'], alpha: '1' })
    expect(parseCssColor('rgba(0 1)')).eql(undefined)
    expect(parseCssColor('rgba(0 1 / 2)')).eql(undefined)
    expect(parseCssColor('rgb(0 1 2)')).eql({ type: 'rgb', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('rgba(0 1 2)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('rgba(0 1 2 3)')).eql(undefined)
    expect(parseCssColor('rgba(0 1 2 3 4)')).eql(undefined)

    expect(parseCssColor('color(rgb 0 1 2)')).eql({ type: 'rgb', components: ['0', '1', '2'], alpha: undefined })
    expect(parseCssColor('color(rgba 0 1 2)')).eql({ type: 'rgba', components: ['0', '1', '2'], alpha: undefined })
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

    expect(fn('rgb(0,1,2)')).eql('rgb(0 1 2)')
    expect(fn('rgba(0,1,2,3)')).eql('rgba(0, 1, 2, 3)')
    expect(fn('rgba(0,(1),2,3)')).eql('rgba(0, (1), 2, 3)')

    expect(fn('rgba(0 1 2 / 3)')).eql('rgba(0, 1, 2, 3)')
    expect(fn('rgba(0 1 2/ 3)')).eql('rgba(0, 1, 2, 3)')
    expect(fn('rgba(0 1 2 /3)')).eql('rgba(0, 1, 2, 3)')
    expect(fn('rgba(0 1 2/3)')).eql('rgba(0, 1, 2, 3)')

    expect(fn('color(rgba 0 1 2 / 3)')).eql('rgba(0, 1, 2, 3)')
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
})
