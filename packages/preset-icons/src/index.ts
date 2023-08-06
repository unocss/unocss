import type { UniversalIconLoader } from '@iconify/utils'
import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { combineLoaders, createPresetIcons } from './core'
import { isNode, isVSCode } from './utils'

export * from './core'
/* TODO BEGIN-CLEANUP: types from @iconify/utils: remove them once published */
export type { AsyncSpriteIcons, AsyncSpriteIconsFactory, SpriteCollection, SpriteIcon } from './types'
/* TODO END-CLEANUP: types from @iconify/utils: remove them once published */

async function createNodeLoader() {
  try {
    return await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
  }
  catch { }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
