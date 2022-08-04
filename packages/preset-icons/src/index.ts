import type { UniversalIconLoader } from '@iconify/utils'
import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { combineLoaders, createPresetIcons } from './core'
import { isNode, isVSCode } from './utils'

export * from './core'

async function createNodeLoader() {
  try {
    return await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
  }
  catch { }
  try {
    return require('@iconify/utils/lib/loader/node-loader.cjs')
  }
  catch { }
}

export const presetIcons = createPresetIcons(async (options) => {
  const {
    cdn,
  } = options

  const loaders: UniversalIconLoader[] = []

  if (isNode && !isVSCode)
    loaders.push(await createNodeLoader())

  if (cdn)
    loaders.push(createCDNLoader(cdn))

  loaders.push(loadIcon)

  return combineLoaders(loaders)
})

export default presetIcons
