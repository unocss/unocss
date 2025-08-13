import type { Provider, WebFontsProviders } from '../types'

export interface FontAxis {
  axis: string
  values: string[]
}

export function generateFontAxes(axes: FontAxis[]): string {
  if (!axes || axes.length === 0)
    return ''

  let combinations: string[][] = [[]]
  for (const { values } of axes) {
    const newCombinations: string[][] = []
    for (const combo of combinations) {
      for (const value of values) {
        newCombinations.push([...combo, value])
      }
    }
    combinations = newCombinations
  }
  return combinations.map(arr => arr.join(',')).join(';')
}

export function createGoogleCompatibleProvider(name: WebFontsProviders, host: string): Provider {
  return {
    name,
    getImportUrl(fonts) {
      const strings = fonts
        .map((i) => {
          let name = i.name.replace(/\s+/g, '+')
          /**
           * When using the Google Fonts API, be sure to list them alphabetically.
           * @see https://fonts.google.com/knowledge/using_type/styling_type_on_the_web_with_variable_fonts
           * @example ital, opsz, slnt, wdth, wght
           */
          const axisValues: FontAxis[] = []
          if (i.italic)
            axisValues.push({ axis: 'ital', values: ['0', '1'] })

          if (i.widths?.length)
            axisValues.push({ axis: 'wdth', values: i.widths.map(w => w.toString()) })

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

export const GoogleFontsProvider: Provider = createGoogleCompatibleProvider('google', 'https://fonts.googleapis.com')
