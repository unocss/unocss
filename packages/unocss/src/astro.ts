import type { AstroIntegrationConfig } from '@unocss/astro'
import AstroIntegration from '@unocss/astro'
import presetUno from '@unocss/preset-uno'

export default function UnocssAstroIntegration<Theme extends {}>(
  config?: AstroIntegrationConfig<Theme>,
) {
  return AstroIntegration(
    config,
    {
      presets: [
        presetUno(),
      ],
    },
  )
}
