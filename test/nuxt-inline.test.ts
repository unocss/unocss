import { describe, expect, it } from 'vitest'
import { withInlineUnoCss } from '../packages-integrations/nuxt/src/inline'

describe('nuxt inlineCss', () => {
  const root = 'C:/project'

  it('always inlines the UnoCSS entry', () => {
    for (const original of [true, false, undefined, () => false]) {
      const inline = withInlineUnoCss(original)
      expect(inline(`${root}/__uno.css`)).toBe(true)
      expect(inline(`${root}/__uno_icons.css`)).toBe(true)
      expect(inline(`${root}/__uno.css?inline`)).toBe(true)
      expect(inline('C:\\project\\__uno.css')).toBe(true)
    }
  })

  it('leaves other ids to the original value', () => {
    expect(withInlineUnoCss(true)(`${root}/app.vue`)).toBe(true)
    expect(withInlineUnoCss(undefined)(`${root}/app.vue`)).toBe(true)
    expect(withInlineUnoCss(false)(`${root}/app.vue`)).toBe(false)
    expect(withInlineUnoCss(false)(undefined)).toBe(false)

    const inline = withInlineUnoCss(id => !!id?.endsWith('.vue'))
    expect(inline(`${root}/app.vue`)).toBe(true)
    expect(inline(`${root}/app.css`)).toBe(false)
    expect(inline(undefined)).toBe(false)
  })

  it('does not match look-alike ids', () => {
    const inline = withInlineUnoCss(false)
    expect(inline(`${root}/my__uno.css`)).toBe(false)
    expect(inline(`${root}/__unox.css`)).toBe(false)
    expect(inline(`${root}/__uno.css.map`)).toBe(false)
  })

  it('supports a custom virtual module prefix', () => {
    const inline = withInlineUnoCss(false, '__custom')
    expect(inline(`${root}/__custom.css`)).toBe(true)
    expect(inline(`${root}/__custom_layer.css`)).toBe(true)
    expect(inline(`${root}/__uno.css`)).toBe(false)
  })
})
