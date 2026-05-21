import type { UnoCSSEslintConfigs, UnoCSSEslintPluginModule } from './types'
import configsFlat from './configs/flat'
import configsRecommended from './configs/recommended'
import { plugin } from './plugin'
import './types'

export type {
  UnoCSSEslintConfigs,
  UnoCSSEslintFlatConfig,
  UnoCSSEslintPlugin,
  UnoCSSEslintPluginModule,
  UnoCSSEslintRecommendedConfig,
} from './types'

export const configs: UnoCSSEslintConfigs = {
  recommended: configsRecommended,
  flat: configsFlat,
}

const eslintPlugin: UnoCSSEslintPluginModule = {
  ...plugin,
  configs,
}

export default eslintPlugin
