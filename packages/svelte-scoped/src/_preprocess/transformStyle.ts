import { type UnoGenerator, toArray } from '@unocss/core'
import type { Processed } from 'svelte/types/compiler/preprocess'
import MagicString from 'magic-string'
import { transformApply } from './transformApply'
import { transformTheme } from './transformTheme'
import type { TransformApplyOptions } from './types'

const DEFAULT_APPLY_VARIABLES = ['--at-apply']

export function checkForApply(content: string, _applyVariables: TransformApplyOptions['applyVariables']) {
  if (_applyVariables === false)
    return { hasApply: false, applyVariables: [] }
  const applyVariables = toArray(_applyVariables || DEFAULT_APPLY_VARIABLES)
  return {
    hasApply: content.includes('@apply') || applyVariables.some(v => content.includes(v)),
    applyVariables,
  }
}

export async function transformStyle({
  content,
  uno,
  prepend,
  filename,
  applyVariables,
  hasThemeFn,
}: {
  content: string
  uno: UnoGenerator
  filename?: string
  prepend: string
  applyVariables: string[]
  hasThemeFn: boolean
}): Promise<Processed | void> {
  const s = new MagicString(content)

  if (applyVariables?.length)
    await transformApply({ s, uno, applyVariables })

  if (hasThemeFn)
    transformTheme(s, uno.config.theme)

  if (!s.hasChanged())
    return

  if (prepend)
    s.prepend(prepend)

  return {
    code: s.toString(),
    map: s.generateMap({ hires: true, source: filename || '' }),
  }
}
