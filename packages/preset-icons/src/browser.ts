import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { createPresetIcons } from './core'

export * from './core'

export const presetIcons = createPresetIcons(async (options) => {
  const { cdn } = options
  if (cdn)
    return createCDNLoader(cdn)
  return loadIcon
})

export default presetIcons
