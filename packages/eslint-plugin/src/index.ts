import configsRecommended from './configs/recommended'
import configsFlat from './configs/flat'
import { plugin } from './plugin'

export default {
  ...plugin,
  configs: {
    recommended: configsRecommended,
    flat: configsFlat,
  },
}
