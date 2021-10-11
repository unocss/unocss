import type { Awaitable, Preset } from '@unocss/core'
import type { IconifyJSON } from '@iconify/types'
import { iconToSVG } from '@iconify/utils/lib/svg/build'
import { defaults as DefaultIconCustomizations } from '@iconify/utils/lib/customisations'
import { getIconData } from '@iconify/utils/lib/icon-set/get-icon'

export interface Options {
  scale?: number
  mode?: 'mask' | 'background-img' | 'auto'
  prefix?: string
  collections?: Record<string, IconifyJSON | undefined | (() => Awaitable<IconifyJSON | undefined>)>
}

const isNode = typeof process < 'u' && typeof process.stdout < 'u'

const warned = new Set<string>()

function warnOnce(msg: string) {
  if (warned.has(msg))
    return
  console.warn(msg)
  warned.add(msg)
}

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
  if (!iconSet) {
    warnOnce(`[unocss] failed to load icon set "${collection}"`)
    return
  }

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

// https://bl.ocks.org/jennyknuth/222825e315d45a738ed9d6e04c7a88d0
function encodeSvg(svg: string) {
  return svg.replace('<svg', (~svg.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'))
    .replace(/"/g, '\'')
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
}

export const preset = ({
  scale = 1,
  mode = 'auto',
  prefix = 'i-',
  collections = {},
}: Options = {}): Preset => {
  return {
    rules: [
      [new RegExp(`^${prefix}(\\w+)-(.+)$`), async([, c, n]) => {
        const svg = await searchForIcon(c, n, collections, scale)
        if (!svg) return

        let _mode = mode
        if (_mode === 'auto')
          _mode = svg.includes('currentColor') ? 'mask' : 'background-img'

        const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

        if (_mode === 'mask') {
          // Thanks to https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
          return {
            '--un-icon': url,
            '-webkit-mask': 'var(--un-icon) no-repeat',
            '-webkit-mask-size': '100% 100%',
            'mask': 'var(--un-icon) no-repeat',
            'mask-size': '100% 100%',
            'background-color': 'currentColor',
            'height': `${scale}em`,
            'width': `${scale}em`,
          }
        }
        else {
          return {
            'background': `${url} no-repeat`,
            'background-size': '100% 100%',
            'background-color': 'transparent',
            'height': `${scale}em`,
            'width': `${scale}em`,
          }
        }
      }],
    ],
  }
}

export default preset
