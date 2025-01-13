import type { UniversalIconLoader } from '@iconify/utils'
import type { IconsAPI, IconsOptions } from './core'
import { loadIcon } from '@iconify/utils'
import { definePreset } from '@unocss/core'
import { createCDNLoader } from './cdn'
import { combineLoaders, createPresetIcons, getEnvFlags } from './core'

export * from './core'

const _factory = /* @__PURE__ */ createPresetIcons(async (options) => {
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
export const presetIcons = /* @__PURE__ */ definePreset((options: IconsOptions = {}) => {
  const preset = _factory(options)

  const api = preset.api as IconsAPI
  api.createNodeLoader = createNodeLoader

  return preset
})

export async function createNodeLoader(): Promise<UniversalIconLoader | undefined> {
  try {
    return await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
  }
  catch { }
  try {
    // eslint-disable-next-line ts/no-require-imports
    return require('@iconify/utils/lib/loader/node-loader.cjs').loadNodeIcon
  }
  catch { }
}

export default presetIcons
