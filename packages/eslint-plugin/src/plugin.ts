import orderAttributify from './rules/order-attributify'
import order from './rules/order'
import blocklist from './rules/blocklist'
import enforceClassCompile from './rules/enforce-class-compile'

export const plugin = {
  rules: {
    order,
    'order-attributify': orderAttributify,
    blocklist,
    'enforce-class-compile': enforceClassCompile,
  },
}
