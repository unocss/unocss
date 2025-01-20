import type { AstroIntegrationConfig } from '@unocss/astro'
import type { AstroIntegration } from 'astro'
import AstroIntegrationPlugin from '@unocss/astro'
import presetUno from '@unocss/preset-uno'

export default function UnocssAstroIntegration<Theme extends object>(
  config?: AstroIntegrationConfig<Theme>,
): AstroIntegration {
  return AstroIntegrationPlugin(
    config,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
