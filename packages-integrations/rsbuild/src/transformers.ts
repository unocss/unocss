import type { EncodedSourceMap } from '@jridgewell/remapping'
import type { SourceCodeTransformerEnforce, UnocssPluginContext } from '@unocss/core'
import remapping from '@jridgewell/remapping'
import MagicString from 'magic-string'
import { applyTransformers } from '#integration/transformers'

const enforceOrder: SourceCodeTransformerEnforce[] = ['pre', 'default', 'post']

export async function transformSource(
  context: UnocssPluginContext,
  source: string,
  id: string,
) {
  let code = source
  const maps: EncodedSourceMap[] = []

  for (const enforce of enforceOrder) {
    const result = await applyTransformers(context, code, id, enforce)
    if (!result)
      continue
    code = result.code
    if (result.map)
      maps.push(result.map as EncodedSourceMap)
  }

  if (code === source)
    return { code }

  const map = maps.length === 1
    ? maps[0]
    : remapping([...maps].reverse(), () => null)

  return {
    code,
    map: map ?? new MagicString(code).generateMap({ hires: true, source: id }),
  }
}
