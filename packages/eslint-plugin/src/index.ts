import order from './rules/order'
import orderAttributify from './rules/order-attributify'
import configsRecommended from './configs/recommended'

export default {
  rules: {
    order,
    'order-attributify': orderAttributify,
  },
  configs: {
    recommended: configsRecommended,
  },
}
