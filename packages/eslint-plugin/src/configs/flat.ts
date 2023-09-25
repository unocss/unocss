import { plugin } from '../plugin'

export default {
  plugins: {
    unocss: plugin,
  },
  rules: {
    'unocss/order': 'warn',
    'unocss/order-attributify': 'warn',
  } as const,
}
