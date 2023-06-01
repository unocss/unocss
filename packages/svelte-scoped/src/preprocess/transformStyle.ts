import type { UnoGenerator } from '@unocss/core'
import { toArray } from '@unocss/core'
import type { Processed } from 'svelte/types/compiler/preprocess'
import MagicString from 'magic-string'
import type { TransformApplyOptions } from './types'
import { transformApply } from './transformApply'
import { themeRE, transformTheme } from './transformTheme'

const DEFAULT_APPLY_VARIABLES = ['--at-apply']

export async function transformStyle({ content, uno, prepend, applyVariables, filename }: {
  content: string
  uno: UnoGenerator
  prepend?: string
  applyVariables?: TransformApplyOptions['applyVariables']
  filename?: string
}): Promise<Processed | void> {
  applyVariables = toArray(applyVariables || DEFAULT_APPLY_VARIABLES)
  const hasApply = content.includes('@apply') || applyVariables.some(v => content.includes(v))

  const hasThemeFn = content.match(themeRE)

  if (!hasApply && !hasThemeFn)
    return

  const s = new MagicString(content)

  if (hasApply)
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
