import { describe, expect, it } from 'vitest'
import { LAYER_MARK_ALL } from '../src/constants'
import { resolveLayer } from '../src/layers'

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
