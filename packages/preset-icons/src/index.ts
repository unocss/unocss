import type { Preset } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import type {
  IconifyLoaderOptions,
  UniversalIconLoader,
} from '@iconify/utils/lib/loader/types'
import { loadIcon } from '@iconify/utils'
import { encodeSvgForCss } from '@iconify/utils/lib/svg/encode-svg-for-css'
import { isNode, isVSCode } from './utils'
import type { IconsOptions } from './types'

const COLLECTION_NAME_PARTS_MAX = 3

export { IconsOptions }

async function lookupIconLoader(): Promise<UniversalIconLoader> {
  let useIconLoader: UniversalIconLoader | undefined
  if (isNode && !isVSCode) {
    try {
      useIconLoader = await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
    }
    catch {
      try {
        useIconLoader = require('@iconify/utils/lib/loader/node-loader.cjs')
      }
      catch {
        useIconLoader = loadIcon
      }
    }
  }

  return useIconLoader ?? loadIcon
}

export const preset = (options: IconsOptions = {}): Preset => {
  const {
    scale = 1,
    mode = 'auto',
    prefix = 'i-',
    warn = false,
    collections: customCollections,
    extraProperties = {},
    customizations = {},
    autoInstall = false,
    layer = 'icons',
  } = options
  return {
    name: '@unocss/preset-icons',
    enforce: 'pre',
    options,
    layers: {
      icons: -10,
    },
    rules: [[
      new RegExp(`^${prefix}([a-z0-9:-]+)(?:\\?(mask|bg))?$`),
      async([full, body, _mode]) => {
        let collection = ''
        let name = ''
        let svg: string | undefined

        const iconLoader = await lookupIconLoader()
        const iconifyLoaderOptions: IconifyLoaderOptions = {
          addXmlNs: true,
          scale,
          customCollections,
          autoInstall,
          warn: warn ? full : undefined,
          customizations: {
            ...customizations,
            additionalProps: { ...extraProperties },
            trimCustomSvg: true,
          },
          usedProps: {},
        }

        if (body.includes(':')) {
          [collection, name] = body.split(':')
          svg = await iconLoader(collection, name, iconifyLoaderOptions)
        }
        else {
          const parts = body.split(/-/g)
          for (let i = COLLECTION_NAME_PARTS_MAX; i >= 1; i--) {
            collection = parts.slice(0, i).join('-')
            name = parts.slice(i).join('-')
            svg = await iconLoader(collection, name, iconifyLoaderOptions)
            if (svg)
              break
          }
        }

        if (!svg) {
          if (warn)
            warnOnce(`failed to load icon "${full}"`)
          return
        }

        _mode = _mode || mode
        if (_mode === 'auto')
          _mode = svg.includes('currentColor') ? 'mask' : 'background-img'

        const url = `url("data:image/svg+xml;utf8,${encodeSvgForCss(svg)}")`

        if (_mode === 'mask') {
          // Thanks to https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
          return {
            '--un-icon': url,
            'mask': 'var(--un-icon) no-repeat',
            'mask-size': '100% 100%',
            '-webkit-mask': 'var(--un-icon) no-repeat',
            '-webkit-mask-size': '100% 100%',
            'background-color': 'currentColor',
            ...iconifyLoaderOptions.usedProps!,
          }
        }
        else {
          return {
            'background': `${url} no-repeat`,
            'background-size': '100% 100%',
            'background-color': 'transparent',
            ...iconifyLoaderOptions.usedProps!,
          }
        }
      },
      { layer },
    ]],
  }
}

export default preset
