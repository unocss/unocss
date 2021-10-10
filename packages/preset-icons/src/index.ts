import fs from 'fs'
import { Preset } from '@unocss/core'
import { IconifyJSON } from '@iconify/types'
import { iconToSVG } from '@iconify/utils/lib/svg/build'
import { defaults as DefaultIconCustomizations } from '@iconify/utils/lib/customisations'
import { getIconData } from '@iconify/utils/lib/icon-set/get-icon'
import { resolveModule } from 'local-pkg'

export interface Options {
  scale?: number
  mode?: 'mask' | 'background-img' | 'auto'
}

const _collections: Record<string, IconifyJSON | false> = {}

function loadCollection(name: string): IconifyJSON | undefined {
  if (_collections[name] === false)
    return

  if (_collections[name])
    return _collections[name] as IconifyJSON

  const jsonPath = resolveModule(`@iconify-json/${name}/icons.json`)
  if (jsonPath) {
    const icons = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    _collections[name] = icons
    return icons
  }
  else {
    _collections[name] = false
    return undefined
  }
}

function searchForIcon(collection: string, id: string, scale: number) {
  const iconSet = loadCollection(collection)
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
}: Options = {}): Preset => {
  return {
    rules: [
      [/^i-(\w+)-(.+)$/, ([, c, n]) => {
        const svg = searchForIcon(c, n, scale)
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
