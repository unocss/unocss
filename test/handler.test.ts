import { describe, expect, it } from 'vitest'
import { handler as h } from '@unocss/preset-mini/utils'

describe('value handler', () => {
  it('bracket math function', () => {
    expect(h.bracket('[calc(1-2)]')).eql('calc(1 - 2)')
    expect(h.bracket('[min(1-2)]')).eql('min(1 - 2)')
    expect(h.bracket('[max(1-2)]')).eql('max(1 - 2)')
    expect(h.bracket('[clamp(1-2)]')).eql('clamp(1 - 2)')

    expect(h.bracket('[calc(1+2)]')).eql('calc(1 + 2)')
    expect(h.bracket('[calc(1/2)]')).eql('calc(1 / 2)')
    expect(h.bracket('[calc(1*2)]')).eql('calc(1 * 2)')
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

  it('bracket raw-type', () => {
    expect(h.bracket('[raw:a b]')).eql('a b')
    expect(h.bracket('[raw:a_b]')).eql('a_b')
    expect(h.bracket('[raw:a\\_b]')).eql('a\\_b')
    expect(h.bracket('[raw:attr("data-label") ":" attr("data-value")]')).eql('attr("data-label") ":" attr("data-value")')
  })

  it('bracket string-type', () => {
    expect(h.bracket('[string:a_b]')).eql('\'a b\'')
    expect(h.bracket('[string:a\\_b]')).eql('\'a_b\'')
    expect(h.bracket('[string:with-\\,-\'-and-"]')).eql('\'with-\\\\,-\\\'-and-"\'')
  })
})
