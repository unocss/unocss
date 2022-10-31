import { describe, expect, test } from 'vitest'
import { handler as h } from '@unocss/preset-mini/utils'

describe('value handler', () => {
  test('bracket math function', () => {
    expect(h.bracket('[calc(1-2)]')).eql('calc(1 - 2)')
    expect(h.bracket('[min(1-2)]')).eql('min(1 - 2)')
    expect(h.bracket('[max(1-2)]')).eql('max(1 - 2)')
    expect(h.bracket('[clamp(1-2)]')).eql('clamp(1 - 2)')

    expect(h.bracket('[calc(1+2)]')).eql('calc(1 + 2)')
    expect(h.bracket('[calc(1/2)]')).eql('calc(1 / 2)')
    expect(h.bracket('[calc(1*2)]')).eql('calc(1 * 2)')
  })

  test('bracket curly', () => {
    expect(h.bracket('[foo][bar]')).eql(undefined)
    expect(h.bracket('[[]]')).eql('[]')
    expect(h.bracket('[]]')).eql(undefined)
    expect(h.bracket('[]][[]]]]')).eql(undefined)
    expect(h.bracket('[[][[[]]]]')).eql('[][[[]]]')
  })

  test('bracket underscore', () => {
    expect(h.bracket('[a_b]')).eql('a b')
    expect(h.bracket('[a\\_b]')).eql('a_b')
    expect(h.bracket('[_b_only]')).eql(' b only')
    expect(h.bracket('[\\_b]')).eql('_b')
    expect(h.bracket('[url(a_b)]')).eql('url(a_b)')
    expect(h.bracket('[url(a\\_b)]')).eql('url(a\\_b)')
    expect(h.bracket('[var(--A_B)]')).eql('var(--A B)')
    expect(h.bracket('[var(--A\\_B)]')).eql('var(--A_B)')
  })

  test('bracket string-type', () => {
    expect(h.bracket('[string:a_b]')).eql('a b')
    expect(h.bracket('[string:a\\_b]')).eql('a\_b')
    expect(h.bracket('[string:attr(data-label)_":_"]')).eql('attr(data-label) ": "')
  })

  test('bracket quoted-type', () => {
    expect(h.bracket('[quoted:a_b]')).eql('"a b"')
    expect(h.bracket('[quoted:a\\_b]')).eql('"a_b"')
    expect(h.bracket('[quoted:\'with-\\,-\'-and-"]')).toMatchInlineSnapshot('"\\"\'with-\\\\\\\\,-\'-and-\\\\\\"\\""')
  })

  test('handler resolves numbers using numberWithUnit', () => {
    // normalizations
    expect(h.numberWithUnit('10')).eql(undefined)
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

    // units
    const units = [
      'pt',
      'pc',
      '%',
      'rem', 'em',
      'ex', 'ch', 'ic',

      'vw', 'vh', 'vi', 'vb', 'vmin', 'vmax',
      'svw', 'svh', 'svi', 'svb', 'svmin', 'svmax',
      'lvw', 'lvh', 'lvi', 'lvb', 'lvmin', 'lvmax',
      'dvw', 'dvh', 'dvi', 'dvb', 'dvmin', 'dvmax',
      'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',

      'in', 'cm', 'mm',
      'rpx',
    ]

    expect(units.map(y => h.numberWithUnit(`12.34${y}`))).eql(units.map(y => `12.34${y}`))
  })
})
