import { describe, expect, it } from 'vitest'
import { h } from '@unocss/preset-mini/utils'

describe('value handler', () => {
  it('bracket math function', () => {
    expect(h.bracket('[calc(1-2)]')).eql('calc(1 - 2)')
    expect(h.bracket('[min(1-2)]')).eql('min(1 - 2)')
    expect(h.bracket('[max(1-2)]')).eql('max(1 - 2)')
    expect(h.bracket('[clamp(1-2)]')).eql('clamp(1 - 2)')

    expect(h.bracket('[calc(1+2)]')).eql('calc(1 + 2)')
    expect(h.bracket('[calc(1/2)]')).eql('calc(1 / 2)')
    expect(h.bracket('[calc(1*2)]')).eql('calc(1 * 2)')

    expect(h.bracket('[calc(var(--min-width)_-_2_*_var(--col-gap))]')).eql('calc(var(--min-width) - 2 * var(--col-gap))')
  })

  it('bracket curly', () => {
    expect(h.bracket('[foo][bar]')).eql(undefined)
    expect(h.bracket('[[]]')).eql('[]')
    expect(h.bracket('[]]')).eql(undefined)
    expect(h.bracket('[]][[]]]]')).eql(undefined)
    expect(h.bracket('[[][[[]]]]')).eql('[][[[]]]')
  })

  it('bracket underscore', () => {
    expect(h.bracket('[a_b]')).eql('a b')
    expect(h.bracket('[a\\_b]')).eql('a_b')
    expect(h.bracket('[_b_only]')).eql(' b only')
    expect(h.bracket('[\\_b]')).eql('_b')
    expect(h.bracket('[url(a_b)]')).eql('url(a_b)')
    expect(h.bracket('[url(a\\_b)]')).eql('url(a\\_b)')
    expect(h.bracket('[var(--A_B)]')).eql('var(--A B)')
    expect(h.bracket('[var(--A\\_B)]')).eql('var(--A_B)')
  })

  it('bracket string-type', () => {
    expect(h.bracket('[string:a_b]')).eql('a b')
    expect(h.bracket('[string:a\\_b]')).eql('a\_b')
    expect(h.bracket('[string:attr(data-label)_":_"]')).eql('attr(data-label) ": "')
  })

  it('bracket quoted-type', () => {
    expect(h.bracket('[quoted:a_b]')).eql('"a b"')
    expect(h.bracket('[quoted:a\\_b]')).eql('"a_b"')
    expect(h.bracket('[quoted:\'with-\\,-\'-and-"]'))
      .toMatchInlineSnapshot(`""'with-\\\\,-'-and-\\"""`)
  })

  it('handler resolves numbers using numberWithUnit', () => {
    // normalizations
    expect(h.numberWithUnit('10unknown')).eql(undefined)
    expect(h.numberWithUnit('10 unknown')).eql(undefined)
    expect(h.numberWithUnit('10 px')).eql(undefined)
    expect(h.numberWithUnit('10px')).eql('10px')
    expect(h.numberWithUnit('10.0px')).eql('10px')
    expect(h.numberWithUnit('0px')).eql('0px')
    expect(h.numberWithUnit('.1px')).eql('0.1px')
    expect(h.numberWithUnit('.20px')).eql('0.2px')
    expect(h.numberWithUnit('00.30px')).eql('0.3px')
    expect(h.numberWithUnit('01.40px')).eql('1.4px')

    // no default value
    expect(h.numberWithUnit('10')).eql(undefined)

    // units
    const units = [
      'pt',
      'pc',
      '%',

      'rem',
      'em',
      'rex',
      'ex',
      'rcap',
      'cap',
      'rch',
      'ch',
      'ric',
      'ic',
      'rlh',
      'lh',

      'vw',
      'vh',
      'vi',
      'vb',
      'vmin',
      'vmax',
      'svw',
      'svh',
      'svi',
      'svb',
      'svmin',
      'svmax',
      'lvw',
      'lvh',
      'lvi',
      'lvb',
      'lvmin',
      'lvmax',
      'dvw',
      'dvh',
      'dvi',
      'dvb',
      'dvmin',
      'dvmax',
      'cqw',
      'cqh',
      'cqi',
      'cqb',
      'cqmin',
      'cqmax',

      'in',
      'cm',
      'mm',
      'rpx',
    ]

    expect(units.map(y => h.numberWithUnit(`12.34${y}`))).eql(units.map(y => `12.34${y}`))
  })

  it('handler resolves numbers using time', () => {
    // normalizations
    expect(h.time('10unknown')).eql(undefined)
    expect(h.time('10 unknown')).eql(undefined)
    expect(h.time('10 ms')).eql(undefined)
    expect(h.time('10ms')).eql('10ms')
    expect(h.time('10.0ms')).eql('10ms')
    expect(h.time('0ms')).eql('0ms')
    expect(h.time('0')).eql('0s')
    expect(h.time('.1ms')).eql('0.1ms')
    expect(h.time('.20ms')).eql('0.2ms')
    expect(h.time('00.30ms')).eql('0.3ms')
    expect(h.time('01.40ms')).eql('1.4ms')

    // default value
    expect(h.time('10')).eql('10ms')

    // units
    const units = [
      'ms',
      's',
    ]

    expect(units.map(y => h.time(`12.34${y}`))).eql(units.map(y => `12.34${y}`))
  })

  it('handler resolves numbers using degree', () => {
    // normalizations
    expect(h.degree('10unknown')).eql(undefined)
    expect(h.degree('10 unknown')).eql(undefined)
    expect(h.degree('10 deg')).eql(undefined)
    expect(h.degree('10deg')).eql('10deg')
    expect(h.degree('10.0deg')).eql('10deg')
    expect(h.degree('0deg')).eql('0')
    expect(h.degree('.1deg')).eql('0.1deg')
    expect(h.degree('.20deg')).eql('0.2deg')
    expect(h.degree('00.30deg')).eql('0.3deg')
    expect(h.degree('01.40deg')).eql('1.4deg')

    // default value
    expect(h.degree('10')).eql('10deg')

    // units
    const units = [
      'deg',
      'rad',
      'grad',
      'turn',
    ]

    expect(units.map(y => h.degree(`12.34${y}`))).eql(units.map(y => `12.34${y}`))
  })
})
