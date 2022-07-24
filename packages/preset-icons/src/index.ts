import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { createPresetIcons } from './core'
import { isNode, isVSCode } from './utils'

export * from './core'

export const presetIcons = createPresetIcons(async (options) => {
  const {
    cdn,
  } = options

  if (cdn)
    return createCDNLoader(cdn)

  if (isNode && !isVSCode) {
    try {
      return await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
    }
    catch {}
    try {
      return require('@iconify/utils/lib/loader/node-loader.cjs')
    }
    catch {}
  }
  return loadIcon
})

export default presetIcons
