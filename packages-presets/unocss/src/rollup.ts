import type { RollupPluginConfig } from '@unocss/rollup'
import type { Plugin } from 'rollup'
import presetWind3 from '@unocss/preset-wind3'
import RollupPlugin from '@unocss/rollup'

export * from '@unocss/rollup'

export default function UnocssRollupPlugin<Theme extends object>(
  configOrPath?: RollupPluginConfig<Theme> | string,
): Plugin {
  return RollupPlugin(
    configOrPath,
    {
      presets: [
        presetWind3(),
      ],
    },
  )
}
