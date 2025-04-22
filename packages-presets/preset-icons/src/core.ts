import type { IconifyJSON } from '@iconify/types'
import type { IconifyLoaderOptions, UniversalIconLoader } from '@iconify/utils'
import type { CSSObject } from '@unocss/core'
import type { IconsOptions } from './types'
import { loadIcon } from '@iconify/utils/lib/loader/loader'
import { searchForIcon } from '@iconify/utils/lib/loader/modern'
import { encodeSvgForCss } from '@iconify/utils/lib/svg/encode-svg-for-css'
import { definePreset, warnOnce } from '@unocss/core'
import icons from './collections'

const COLLECTION_NAME_PARTS_MAX = 3

export { IconsOptions }
export { icons }

/**
 * API for preset-icons
 */
export interface IconsAPI {
  encodeSvgForCss: typeof encodeSvgForCss
  parseIconWithLoader: typeof parseIconWithLoader
  /**
   * This API only available for preset-icons created on Node.js environment
   */
  createNodeLoader?: () => Promise<UniversalIconLoader | undefined>
}

export function createPresetIcons(lookupIconLoader: (options: IconsOptions) => Promise<UniversalIconLoader>) {
  return definePreset((options: IconsOptions = {}) => {
    const {
      scale = 1,
      mode = 'auto',
      prefix = 'i-',
      warn = false,
      iconifyCollectionsNames,
      collections: customCollections,
      extraProperties = {},
      customizations = {},
      autoInstall = false,
      collectionsNodeResolvePath,
      layer = 'icons',
      unit,
      processor,
    } = options

    const flags = getEnvFlags()

    const loaderOptions: IconifyLoaderOptions = {
      addXmlNs: true,
      scale,
      customCollections,
      autoInstall,
      cwd: collectionsNodeResolvePath,
      // avoid warn from @iconify/loader: we'll warn below if not found
      warn: undefined,
      customizations: {
        ...customizations,
        additionalProps: { ...extraProperties },
        trimCustomSvg: true,
        async iconCustomizer(collection, icon, props) {
          await customizations.iconCustomizer?.(collection, icon, props)
          if (unit) {
            if (!props.width)
              props.width = `${scale}${unit}`
            if (!props.height)
              props.height = `${scale}${unit}`
          }
        },
      },
    }

    let iconLoader: UniversalIconLoader

    return {
      name: '@unocss/preset-icons',
      enforce: 'pre',
      options,
      layers: { icons: -30 },
      api: <IconsAPI>{
        encodeSvgForCss,
        parseIconWithLoader,
      },
      rules: [[
        /^([\w:-]+)(?:\?(mask|bg|auto))?$/,
        async (matcher) => {
          let [full, body, _mode = mode] = matcher as [string, string, IconsOptions['mode']]

          iconLoader = iconLoader || await lookupIconLoader(options)

          const usedProps = {}
          const parsed = await parseIconWithLoader(
            body,
            iconLoader,
            { ...loaderOptions, usedProps },
            iconifyCollectionsNames,
          )

          if (!parsed) {
            if (warn && !flags.isESLint)
              warnOnce(`failed to load icon "${full}"`)
            return
          }

          let cssObject: CSSObject
          const url = `url("data:image/svg+xml;utf8,${encodeSvgForCss(parsed.svg)}")`

          if (_mode === 'auto')
            _mode = parsed.svg.includes('currentColor') ? 'mask' : 'bg'

          if (_mode === 'mask') {
            // Thanks to https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
            cssObject = {
              '--un-icon': url,
              '-webkit-mask': 'var(--un-icon) no-repeat',
              'mask': 'var(--un-icon) no-repeat',
              '-webkit-mask-size': '100% 100%',
              'mask-size': '100% 100%',
              'background-color': 'currentColor',
              // for Safari https://github.com/elk-zone/elk/pull/264
              'color': 'inherit',
              ...usedProps,
            }
          }
          else {
            cssObject = {
              'background': `${url} no-repeat`,
              'background-size': '100% 100%',
              'background-color': 'transparent',
              ...usedProps,
            }
          }

          processor?.(cssObject, {
            ...parsed,
            icon: parsed.name,
            mode: _mode,
          })

          return cssObject
        },
        { layer, prefix },
      ]],
    }
  })
}

export function combineLoaders(loaders: UniversalIconLoader[]) {
  return (async (...args) => {
    for (const loader of loaders) {
      if (!loader)
        continue
      const result = await loader(...args)
      if (result)
        return result
    }
  }) as UniversalIconLoader
}

export function createCDNFetchLoader(
  fetcher: (url: string) => Promise<any>,
  cdnBase: string,
  cacheMap: Map<string, IconifyJSON | Promise<IconifyJSON>> = new Map(),
): UniversalIconLoader {
  function fetchCollection(name: string) {
    if (!icons.includes(name))
      return undefined
    if (!cacheMap.has(name))
      cacheMap.set(name, fetcher(`${cdnBase}@iconify-json/${name}/icons.json`))
    return cacheMap.get(name)!
  }

  return async (collection, icon, options) => {
    let result = await loadIcon(collection, icon, options)
    if (result)
      return result

    const iconSet = await fetchCollection(collection)
    if (iconSet) {
      // possible icon names
      const ids = [
        icon,
        icon.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
        icon.replace(/([a-z])(\d+)/g, '$1-$2'),
      ]
      result = await searchForIcon(iconSet, collection, ids, options)
    }

    return result
  }
}

export function getEnvFlags() {
  // eslint-disable-next-line node/prefer-global/process
  const isNode = typeof process !== 'undefined' && process.stdout
  // eslint-disable-next-line node/prefer-global/process
  const isVSCode = isNode && !!process.env.VSCODE_CWD
  // eslint-disable-next-line node/prefer-global/process
  const isESLint = isNode && !!process.env.ESLINT

  return {
    isNode,
    isVSCode,
    isESLint,
  }
}

export async function parseIconWithLoader(
  body: string,
  loader: UniversalIconLoader,
  options: IconifyLoaderOptions = {},
  safeCollectionsNames: string[] = [],
) {
  let collection = ''
  let name = ''
  let svg: string | undefined

  const allCollections = new Set<string>([
    ...icons,
    ...safeCollectionsNames,
    ...Object.keys(options.customCollections || {}),
  ])

  if (body.includes(':')) {
    [collection, name] = body.split(':')

    if (!allCollections.has(collection))
      return

    svg = await loader(collection, name, options)
  }
  else {
    const parts = body.split(/-/g)
    for (let i = COLLECTION_NAME_PARTS_MAX; i >= 1; i--) {
      collection = parts.slice(0, i).join('-')

      if (!allCollections.has(collection))
        continue

      name = parts.slice(i).join('-')
      svg = await loader(collection, name, options)

      if (svg)
        break
    }
  }

  if (!svg) {
    return
  }

  return {
    collection,
    name,
    svg,
  }
}
