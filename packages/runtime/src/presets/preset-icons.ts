import type { IconsOptions } from '@unocss/preset-icons'
import { createPresetIcons } from '@unocss/preset-icons'
import { loadIcon } from '@iconify/utils'
import { createCDNFetchLoader } from '../../../preset-icons/src/core'

const presetIcons = createPresetIcons(async (options) => {
  const { cdn } = options
  if (cdn)
    return createCDNFetchLoader(url => fetch(url).then(data => data.json()), cdn)
  return loadIcon
})

window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
  presetIcons: (options: IconsOptions) => presetIcons(options),
})
