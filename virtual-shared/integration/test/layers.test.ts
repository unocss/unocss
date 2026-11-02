import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getCssEscaperForJsContent, getLayerPlaceholder, LAYER_PLACEHOLDER_RE, resolveLayer } from '#integration/layers'

describe('resolveLayer', () => {
  it('matches virtual CSS ids with query strings', async () => {
    const ctx = {
      getVMPRegexes: async () => ({
        prefix: '__uno',
        RESOLVED_ID_RE: /[/\\]__uno(?:_(.*?))?\.css$/,
        RESOLVED_ID_WITH_QUERY_RE: /[/\\]__uno(_.*?)?\.css(\?.*)?$/,
      }),
    } as any

    expect(await resolveLayer(ctx, '/__uno.css')).toBe(LAYER_MARK_ALL)
    expect(await resolveLayer(ctx, '/__uno.css?inline')).toBe(LAYER_MARK_ALL)
    expect(await resolveLayer(ctx, '/src/__uno.css?inline')).toBe(LAYER_MARK_ALL)
    expect(await resolveLayer(ctx, '/__uno_shortcuts.css?inline')).toBe('shortcuts')
  })
})

describe('getCssEscaperForJsContent', () => {
  const css = '/* " \' ` \\ */\r\n.example::before {\r  content: "a\\\\b \\"quoted\\"";\n  --separators: "\u2028\u2029";\n}'

  function insertCss(source: string) {
    let replacements = 0
    const result = source.replace(LAYER_PLACEHOLDER_RE, (_, _layer, view) => {
      replacements += 1
      return getCssEscaperForJsContent(view)(css)
    })
    expect(replacements).toBe(1)
    return result
  }

  it.each([0, 1, 2, 3])('round-trips CSS through %i JSON.stringify embedding levels', (levels) => {
    let source = getLayerPlaceholder('default')
    for (let i = 0; i < levels; i++)
      source = JSON.stringify(source)

    let result = insertCss(source)
    for (let i = 0; i < levels; i++)
      result = runInNewContext(result, Object.create(null), { timeout: 1000 })

    expect(result).toBe(css)
  })

  it.each(['"', '\'', '`'])('round-trips CSS inside the %s JavaScript delimiter', (delimiter) => {
    const placeholder = getLayerPlaceholder('default')
      .replaceAll('\\', '\\\\')
      .replaceAll(delimiter, `\\${delimiter}`)
    const source = insertCss(`${delimiter}${placeholder}${delimiter}`)

    expect(runInNewContext(source, Object.create(null), { timeout: 1000 })).toBe(css)
  })
})
