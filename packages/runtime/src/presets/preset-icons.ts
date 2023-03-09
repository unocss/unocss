import type { IconsOptions } from '@unocss/preset-icons'
import { createPresetIcons } from '@unocss/preset-icons'
import { loadIcon } from '@iconify/utils'
import { createCDNFetchLoader } from '../../../preset-icons/src/core'

window.__unocss_runtime = window.__unocss_runtime ?? { presets: {} }
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, (() => {
  const presetIcons = createPresetIcons(async (options) => {
    const { cdn } = options
    if (cdn)
      return createCDNFetchLoader(url => fetch(url).then(data => data.json()), cdn)
    return loadIcon
  })
  
  return {
    presetIcons: (options: IconsOptions) => presetIcons(options),
  }
})())
