import type { EncodedSourceMap } from '@jridgewell/remapping'
import type { SourceCodeTransformerEnforce, UnocssPluginContext } from '@unocss/core'
import remapping from '@jridgewell/remapping'
import MagicString from 'magic-string'
import { applyTransformers } from '#integration/transformers'

const enforceOrder: SourceCodeTransformerEnforce[] = ['pre', 'default', 'post']

/**
 * 按 UnoCSS 官方 enforce 顺序运行全部源码 transformer。
 *
 * @param context 当前模块绑定的 UnoCSS 插件上下文。
 * @param source 原始模块源码。
 * @param id 模块标识。
 * @returns 转换后的源码和合并后的 sourcemap。
 */
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
