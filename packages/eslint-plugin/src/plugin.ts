import blocklist from './rules/blocklist'
import enforceClassCompile from './rules/enforce-class-compile'
import order from './rules/order'
import orderAttributify from './rules/order-attributify'

export const plugin = {
  rules: {
    order,
    'order-attributify': orderAttributify,
    blocklist,
    'enforce-class-compile': enforceClassCompile,
  },
}
