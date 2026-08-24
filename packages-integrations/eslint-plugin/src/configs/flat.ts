import type { UnoCSSEslintFlatConfig } from '../types'
import { plugin } from '../plugin'

const flatConfig: UnoCSSEslintFlatConfig = {
  plugins: {
    unocss: plugin,
  },
  rules: {
    'unocss/order': 'warn',
    'unocss/order-attributify': 'warn',
  } as const,
}

export default flatConfig
