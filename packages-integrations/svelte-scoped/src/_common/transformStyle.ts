import type { UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'
import type { TransformApplyOptions } from '../types'
import { toArray } from '@unocss/core'
import { transformApply } from './transformApply'
import { transformTheme } from './transformTheme'

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
  s,
  uno,
  prepend,
  applyVariables,
  transformThemeFn,
}: {
  s: MagicString
  uno: UnoGenerator
  prepend: string
  applyVariables: string[]
  transformThemeFn: boolean
}): Promise<void> {
  if (applyVariables?.length)
    await transformApply({ s, uno, applyVariables })

  if (transformThemeFn)
    transformTheme(s, uno.config.theme)

  if (!s.hasChanged())
    return

  if (prepend)
    s.prepend(prepend)
}
