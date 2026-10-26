import type { LooseRuleDefinition } from '@typescript-eslint/utils/ts-eslint'
import type { Linter } from 'eslint'

type UnocssEnforceClassCompile = [] | [{
  prefix?: string
  enableFix?: boolean
}]

type UnocssOrder = [] | [{
  unoFunctions?: string[]
  unoVariables?: string[]
}]

export interface UnoCSSEslintPlugin {
  rules: Record<string, LooseRuleDefinition>
}

export interface UnoCSSEslintFlatConfig extends Linter.Config {
  plugins: {
    unocss: any
  }
  rules: {
    readonly 'unocss/order': Linter.RuleEntry<UnocssOrder>
    readonly 'unocss/order-attributify': Linter.RuleEntry<[]>
    readonly 'unocss/blocklist'?: Linter.RuleEntry<[]>
    readonly 'unocss/enforce-class-compile'?: Linter.RuleEntry<UnocssEnforceClassCompile>
  }
}

export interface UnoCSSEslintRecommendedConfig extends Linter.LegacyConfig {
  rules: {
    readonly '@unocss/order': Linter.RuleEntry<UnocssOrder>
    readonly '@unocss/order-attributify': Linter.RuleEntry<[]>
    readonly '@unocss/blocklist'?: Linter.RuleEntry<[]>
    readonly '@unocss/enforce-class-compile'?: Linter.RuleEntry<UnocssEnforceClassCompile>
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
