import type { Awaitable, Preset } from '@unocss/core'
import type { IconifyJSON } from '@iconify/types'
import { iconToSVG } from '@iconify/utils/lib/svg/build'
import { defaults as DefaultIconCustomizations } from '@iconify/utils/lib/customisations'
import { getIconData } from '@iconify/utils/lib/icon-set/get-icon'
import { encodeSvg, isNode, warnOnce } from './utils'

export interface Options {
  scale?: number
  mode?: 'mask' | 'background-img' | 'auto'
  prefix?: string
  warn?: boolean
  collections?: Record<string, IconifyJSON | undefined | (() => Awaitable<IconifyJSON | undefined>)>
  extraProperties?: Record<string, string>
  /**
   * Rule layer
   * @default 'icons'
   */
  layer?: string
}

const COLLECTION_NAME_PARTS_MAX = 3

async function searchForIcon(
  collection: string,
  id: string,
  collections: Required<Options>['collections'],
  scale: number,
) {
  let iconSet = collections[collection]
  if (typeof iconSet === 'function')
    iconSet = await iconSet()
  if (!iconSet && isNode) {
    const { loadCollectionFromFS } = await import('./fs')
    iconSet = await loadCollectionFromFS(collection)
  }
  if (!iconSet)
    return

  const iconData = getIconData(iconSet, id, true)
  if (iconData) {
    const { attributes, body } = iconToSVG(iconData, {
      ...DefaultIconCustomizations,
      height: `${scale}em`,
      width: `${scale}em`,
    })
    return `<svg ${Object.entries(attributes).map(i => `${i[0]}="${i[1]}"`).join(' ')}>${body}</svg>`
  }
}

export const preset = ({
  scale = 1,
  mode = 'auto',
  prefix = 'i-',
  warn = false,
  collections = {},
  extraProperties = {},
  layer = 'icons',
}: Options = {}): Preset => {
  return {
    enforce: 'pre',
    layers: {
      icons: -10,
    },
    rules: [[
      new RegExp(`^${prefix}([a-z0-9:-]+)$`),
      async([full, body]) => {
        let collection = ''
        let name = ''
        let svg: string | undefined

        if (body.includes(':')) {
          [collection, name] = body.split(':')
          svg = await searchForIcon(collection, name, collections, scale)
        }
        else {
          const parts = body.split(/-/g)
          for (let i = COLLECTION_NAME_PARTS_MAX; i >= 1; i--) {
            collection = parts.slice(0, i).join('-')
            name = parts.slice(i).join('-')
            svg = await searchForIcon(collection, name, collections, scale)
            if (svg)
              break
          }
        }

        if (!svg) {
          if (warn)
            warnOnce(`[unocss] failed to load icon "${full}"`)
          return
        }

        let _mode = mode
        if (_mode === 'auto')
          _mode = svg.includes('currentColor') ? 'mask' : 'background-img'

        const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

        if (_mode === 'mask') {
          // Thanks to https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
          return {
            '--un-icon': url,
            'mask': 'var(--un-icon) no-repeat',
            'mask-size': '100% 100%',
            '-webkit-mask': 'var(--un-icon) no-repeat',
            '-webkit-mask-size': '100% 100%',
            'background-color': 'currentColor',
            'height': `${scale}em`,
            'width': `${scale}em`,
            ...extraProperties,
          }
        }
        else {
          return {
            'background': `${url} no-repeat`,
            'background-size': '100% 100%',
            'background-color': 'transparent',
            'height': `${scale}em`,
            'width': `${scale}em`,
            ...extraProperties,
          }
        }
      },
      { layer },
    ]],
  }
}

export default preset
