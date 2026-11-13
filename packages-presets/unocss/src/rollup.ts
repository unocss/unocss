import type { RollupPluginConfig, UnoCSSRollupPlugin } from '@unocss/rollup'
import presetWind3 from '@unocss/preset-wind3'
import RollupPlugin from '@unocss/rollup'

export * from '@unocss/rollup'

export default function UnocssRollupPlugin<Theme extends object>(
  configOrPath?: RollupPluginConfig<Theme> | string,
): UnoCSSRollupPlugin {
  return RollupPlugin(
    configOrPath,
    {
      presets: [
        presetWind3(),
      ],
    },
  )
}
