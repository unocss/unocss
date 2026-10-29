import type { AstroIntegrationConfig } from '@unocss/astro'
import AstroIntegrationPlugin from '@unocss/astro'
import presetWind3 from '@unocss/preset-wind3'

export default function UnocssAstroIntegration<Theme extends object>(
  config?: AstroIntegrationConfig<Theme>,
): ReturnType<typeof AstroIntegrationPlugin> {
  return AstroIntegrationPlugin(
    config,
    {
      presets: [
        presetWind3(),
      ],
    },
  )
}
