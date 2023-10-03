import orderAttributify from './rules/order-attributify'
import order from './rules/order'
import blocklist from './rules/blocklist'

export const plugin = {
  rules: {
    order,
    'order-attributify': orderAttributify,
    blocklist,
  },
}
