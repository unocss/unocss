import order from './rules/order'
import orderAttributify from './rules/order-attributify'
import blocklist from './rules/blocklist'
import configsRecommended from './configs/recommended'

export default {
  rules: {
    order,
    'order-attributify': orderAttributify,
    blocklist,
  },
  configs: {
    recommended: configsRecommended,
  },
}
