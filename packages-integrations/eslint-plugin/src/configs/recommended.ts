import type { UnoCSSEslintRecommendedConfig } from '../types'

const recommendedConfig: UnoCSSEslintRecommendedConfig = {
  plugins: ['@unocss'],
  rules: {
    '@unocss/order': 'warn',
    '@unocss/order-attributify': 'warn',
  } as const,
}

export default recommendedConfig
