import type { Provider, WebFontsProviders } from '../types'
import type { FontAxis } from './google'
import { generateFontAxes } from './google'

export function createCoolLabsCompatibleProvider(name: WebFontsProviders, host: string): Provider {
  return {
    name,
    getImportUrl(fonts) {
      const strings = fonts
        .map((i) => {
          let name = i.name.replace(/\s+/g, '+')
          const axisValues: FontAxis[] = []
          if (i.italic)
            axisValues.push({ axis: 'ital', values: ['0', '1'] })

          if (i.width)
            axisValues.push({ axis: 'wdth', values: Array.isArray(i.width) ? i.width : [i.width.toString()] })

          if (i.weights?.length)
            axisValues.push({ axis: 'wght', values: i.weights.map(w => w.toString()) })

          if (axisValues.length) {
            name += ':'
            name += axisValues.map(a => a.axis).join(',')
            name += '@'
            name += generateFontAxes(axisValues)
          }
          return `family=${name}`
        })
        .join('&')
      return `${host}/css2?${strings}&display=swap`
    },
  }
}

export const CoolLabsFontsProvider: Provider = createCoolLabsCompatibleProvider('coollabs', 'https://api.fonts.coollabs.io')
