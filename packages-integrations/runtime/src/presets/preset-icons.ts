import type { IconsOptions } from '@unocss/preset-icons'
import type { RuntimeContext } from '..'
import { loadIcon } from '@iconify/utils'
import { createPresetIcons } from '@unocss/preset-icons'
import { createCDNFetchLoader } from '../../../../packages-presets/preset-icons/src/core'

window.__unocss_runtime = window.__unocss_runtime ?? {} as RuntimeContext
window.__unocss_runtime.presets = Object.assign(window.__unocss_runtime?.presets ?? {}, (() => {
  const presetIcons = createPresetIcons(async (options) => {
    const fetcher = options?.customFetch ?? (url => fetch(url).then(data => data.json()))
    const cdn = options?.cdn
    if (cdn)
      return createCDNFetchLoader(fetcher, cdn)
    return loadIcon
  })

  return {
    presetIcons: (options: IconsOptions) => presetIcons(options),
  }
})())
