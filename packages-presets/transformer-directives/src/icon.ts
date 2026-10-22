import type { Preset, UnoGenerator } from '@unocss/core'
import type { IconsAPI, IconsOptions } from '@unocss/preset-icons'
import { toArray } from '@unocss/core'

export async function transformIconString(uno: UnoGenerator, icon: string, color?: string) {
  const presetIcons = uno.config.presets?.flat()?.find(i => i.name === '@unocss/preset-icons') as Preset | undefined

  if (!presetIcons) {
    console.warn('@unocss/preset-icons not found, icon() directive will be keep as-is')
    return
  }

  const { prefix = 'i-' } = presetIcons.options as IconsOptions

  const api = presetIcons.api as IconsAPI

  for (const p of toArray(prefix)) {
    if (icon.startsWith(p)) {
      const parsed = await api.parseIcon(icon.slice(p.length), {
        customizations: { additionalProps: {} },
      })
      if (parsed)
        return `url("data:image/svg+xml;utf8,${color ? api.encodeSvgForCss(parsed.svg).replace(/currentcolor/gi, color) : api.encodeSvgForCss(parsed.svg)}")`
    }
  }
}
