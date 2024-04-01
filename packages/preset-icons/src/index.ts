import type { UniversalIconLoader } from '@iconify/utils'
import { loadIcon } from '@iconify/utils'
import { createCDNLoader } from './cdn'
import { combineLoaders, createPresetIcons, getEnvFlags } from './core'

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

/**
 * Use any icon with Pure CSS for UnoCSS.
 *
 * @example
 *
 * ```html
 * <div class="i-mdi-alarm"></div>
 * <div class="i-logos-vue text-3xl"></div>
 * <button class="i-carbon-sun dark:i-carbon-moon"></div>
 * ```
 *
 * @see https://unocss.dev/presets/icons
 */
export const presetIcons = /* @__PURE__ */ createPresetIcons(async (options) => {
  const {
    cdn,
  } = options

  const loaders: UniversalIconLoader[] = []

  const {
    isNode,
    isVSCode,
    isESLint,
  } = getEnvFlags()

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
