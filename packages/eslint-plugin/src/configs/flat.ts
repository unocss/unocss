import { plugin } from '../plugin'

export default {
  plugin: {
    unocss: plugin,
  },
  rules: {
    'unocss/order': 'warn',
    'unocss/order-attributify': 'warn',
  } as const,
}
