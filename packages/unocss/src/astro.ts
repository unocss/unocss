import type { AstroIntegrationConfig } from '@unocss/astro'
import AstroIntegrationPlugin from '@unocss/astro'
import presetUno from '@unocss/preset-uno'
import type { AstroIntegration } from 'astro'

export default function UnocssAstroIntegration<Theme extends {}>(
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
