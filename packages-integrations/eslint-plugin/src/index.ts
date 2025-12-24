import configsFlat from './configs/flat'
import configsRecommended from './configs/recommended'
import { plugin } from './plugin'
import './types'

export const configs = {
  recommended: configsRecommended,
  flat: configsFlat,
}

export default {
  ...plugin,
  configs,
}
