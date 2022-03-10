import type { Preset } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import { iconToSVG } from '@iconify/utils/lib/svg/build'
import { defaults as DefaultIconCustomizations } from '@iconify/utils/lib/customisations'
import { getIconData } from '@iconify/utils/lib/icon-set/get-icon'
import { encodeSvg, isNode } from './utils'
import type { IconsOptions } from './types'

const COLLECTION_NAME_PARTS_MAX = 3

export { IconsOptions }

async function importFsModule(): Promise<typeof import('./fs') | undefined> {
  try {
    return await import('./fs')
  }
  catch {
    try {
      // cjs environments
      return require('./fs.cjs')
    }
    catch {
      return undefined
    }
  }
}

async function searchForIcon(
  collection: string,
  id: string,
  collections: Required<IconsOptions>['collections'],
  scale: number,
) {
  if (!collection || !id)
    return
  let iconSet = collections[collection]
  if (typeof iconSet === 'function')
    iconSet = await iconSet()
  if (!iconSet && isNode) {
    try {
      const loadCollectionFromFS = await importFsModule().then(i => i?.loadCollectionFromFS)
      if (loadCollectionFromFS)
        iconSet = await loadCollectionFromFS(collection)
    }
    catch {}
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
    return body.includes('xlink:')
      ? `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${Object.entries(attributes).map(i => `${i[0]}="${i[1]}"`).join(' ')}>${body}</svg>`
      : `<svg ${Object.entries(attributes).map(i => `${i[0]}="${i[1]}"`).join(' ')}>${body}</svg>`
  }
}

export const preset = (options: IconsOptions = {}): Preset => {
  const {
    scale = 1,
    mode = 'auto',
    prefix = 'i-',
    warn = false,
    collections = {},
    extraProperties = {},
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
            warnOnce(`failed to load icon "${full}"`)
          return
        }

        _mode = _mode || mode
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
