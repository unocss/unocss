import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { createCDNFetchLoader, createPresetIcons } from './core'

export * from './core'

export const presetIcons = createPresetIcons(async (options) => {
  const fetcher = options?.customFetch
  const cdn = options?.cdn
  if (fetcher && cdn)
    return createCDNFetchLoader(fetcher, cdn)
  if (cdn)
    return createCDNLoader(cdn)
  return loadIcon
})

export default presetIcons
