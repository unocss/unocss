import type {
  ClassicConfig,
  FlatConfig,
  LooseRuleDefinition,
  SharedConfig,
} from '@typescript-eslint/utils/ts-eslint'

type UnoCSSEslintRuleEntry = SharedConfig.RuleLevel

export interface UnoCSSEslintPlugin {
  rules: Record<string, LooseRuleDefinition>
}

export interface UnoCSSEslintFlatConfig extends FlatConfig.Config {
  plugins: {
    unocss: UnoCSSEslintPlugin
  }
  rules: {
    readonly 'unocss/order': UnoCSSEslintRuleEntry
    readonly 'unocss/order-attributify': UnoCSSEslintRuleEntry
  }
}

export interface UnoCSSEslintRecommendedConfig extends ClassicConfig.Config {
  rules: {
    readonly '@unocss/order': UnoCSSEslintRuleEntry
    readonly '@unocss/order-attributify': UnoCSSEslintRuleEntry
  }
}

export interface UnoCSSEslintConfigs {
  recommended: UnoCSSEslintRecommendedConfig
  flat: UnoCSSEslintFlatConfig
}

export interface UnoCSSEslintPluginModule extends UnoCSSEslintPlugin {
  configs: UnoCSSEslintConfigs
}

declare module '@typescript-eslint/utils/ts-eslint' {
  interface SharedConfigurationSettings {
    unocss?: {
      configPath?: string
    }
  }
}

export {}
