import type { UniversalIconLoader } from '@iconify/utils'
import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { combineLoaders, createPresetIcons } from './core'

export * from './core'

async function createNodeLoader() {
  try {
    return await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
  }
  catch { }
  try {
    // eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
    return require('@iconify/utils/lib/loader/node-loader.cjs').loadNodeIcon
  }
  catch { }
}

export const presetIcons = createPresetIcons(async (options) => {
  const {
    cdn,
  } = options

  const loaders: UniversalIconLoader[] = []

  // eslint-disable-next-line node/prefer-global/process
  const isNode = typeof process !== 'undefined' && process.stdout && !process.versions.deno
  // eslint-disable-next-line node/prefer-global/process
  const isVSCode = isNode && !!process.env.VSCODE_CWD
  // eslint-disable-next-line node/prefer-global/process
  const isESLint = isNode && !!process.env.ESLINT

  if (isNode && !isVSCode && !isESLint) {
    const nodeLoader = await createNodeLoader()
    if (nodeLoader !== undefined)
      loaders.push(nodeLoader)
  }

  if (cdn)
    loaders.push(createCDNLoader(cdn))

  loaders.push(loadIcon)

  return combineLoaders(loaders)
})

export default presetIcons
