import type { Provider, WebFontsProviders } from '../../types'
import type { FontObject, FontSourceResponse, Subset, Variable, Weight } from './types'
import { mergeDeep } from '@unocss/core'

export function createFontSourceProvider(name: WebFontsProviders, host: string): Provider {
  const fontsMap = new Map<string, FontSourceResponse>()
  const variablesMap = new Map<string, Variable>()

  return {
    name,
    async getPreflight(fonts) {
      const list = await Promise.all(fonts.map(async (font) => {
        const css: string[] = []
        const id = font.name.toLowerCase().replace(/\s+/g, '-')
        let metadata = fontsMap.get(id)

        if (!metadata) {
          const url = `https://api.fontsource.org/v1/fonts/${id}`
          try {
            metadata = await (await import('ofetch')).$fetch<FontSourceResponse>(url)
            fontsMap.set(id, metadata)
          }
          catch {
            throw new Error(`Failed to fetch font: ${font.name}`)
          }
        }

        const { weights, unicodeRange, variants, family } = metadata
        const subsets = metadata.subsets.filter(subset => font.subsets ? font.subsets.includes(subset) : true)
        const style = font.italic ? 'italic' : 'normal'

        if (metadata.variable && !font.preferStatic) {
          let variableData = variablesMap.get(id)
          const url = `https://api.fontsource.org/v1/variable/${id}`

          try {
            variableData = await (await import('ofetch')).$fetch<Variable>(url)
            variablesMap.set(id, variableData)
          }
          catch {
            throw new Error(`Failed to fetch font variable: ${font.name}`)
          }

          const mergeAxes = mergeDeep(variableData.axes, font.variable ?? {})

          for (const subset of subsets) {
            if (unicodeRange[subset]) {
              const url = `${host}/fontsource/fonts/${metadata.id}:vf@latest/${subset}-wght-${style}.woff2`

              const fontObj: FontObject = {
                family,
                display: 'swap',
                style,
                weight: 400,
                src: [{
                  url,
                  format: 'woff2-variations',
                }],
                variable: {
                  wght: mergeAxes.wght ?? undefined,
                  wdth: mergeAxes.wdth ?? undefined,
                  slnt: mergeAxes.slnt ?? undefined,
                },
                unicodeRange: unicodeRange[subset],
                comment: `${metadata.id}-${subset}-wght-normal`,
              }

              css.push(generateFontFace(fontObj))
            }
            // if it is numbered subset
            else {
              Object.entries(unicodeRange)
                .filter(([subKey]) => !metadata.subsets.includes(subKey as Subset))
                .forEach(([subKey, range]) => {
                  const url = `${host}/fontsource/fonts/${metadata.id}:vf@latest/${subKey.slice(1, -1)}-wght-${style}.woff2`

                  const fontObj: FontObject = {
                    family,
                    display: 'swap',
                    style,
                    weight: 400,
                    src: [{
                      url,
                      format: 'woff2-variations',
                    }],
                    variable: {
                      wght: mergeAxes.wght ?? undefined,
                      wdth: mergeAxes.wdth ?? undefined,
                      slnt: mergeAxes.slnt ?? undefined,
                    },
                    unicodeRange: range,
                    comment: `${metadata.id}-${subKey}-wght-normal`,
                  }

                  css.push(generateFontFace(fontObj))
                })
            }
          }
        }
        else {
          const _weights = font.weights && font.weights.length > 0 ? font.weights! : weights

          for (const subset of subsets) {
            for (const weight of _weights) {
              const url = variants[weight as Weight][style][subset].url

              const fontObj: FontObject = {
                family,
                display: 'swap',
                style,
                weight: Number(weight),
                src: [{
                  url: url.woff2,
                  format: 'woff2',
                }],
                unicodeRange: unicodeRange[subset],
                comment: `${metadata.id}-${subset}-${weight}-${style}`,
              }

              css.push(generateFontFace(fontObj))
            }
          }
        }

        return css
      }))

      return list.flat().join('\n\n')
    },
  }
}

export const FontSourceProvider: Provider = createFontSourceProvider('fontsource', 'https://cdn.jsdelivr.net')

// Credits to https://github.com/fontsource/fontsource/blob/main/packages/generate/src/index.ts
function generateFontFace(font: FontObject) {
  const {
    family,
    style,
    display,
    weight,
    variable,
    src,
    unicodeRange,
    comment,
    spacer = '\n  ',
  } = font
  // If variable, modify output
  const { wght, wdth, slnt } = variable ?? {}
  let result = '@font-face {'
  result += `${spacer}font-family: '${family}';`

  // If slnt is present, switch to oblique style
  result += `${spacer}font-style: ${
    slnt
      ? `oblique ${Number(slnt.max) * -1}deg ${Number(slnt.min) * -1}deg`
      : style
  };`
  result += `${spacer}font-display: ${display};`
  // If variable wght is present, use min max wght vals
  result += `${spacer}font-weight: ${wght ? getVariableWght(wght) : weight};`

  if (wdth)
    result += `${spacer}font-stretch: ${wdth.min}% ${wdth.max}%;`

  // Merges all formats into a single src
  result += `${spacer}src: ${src
    .map(({ url, format }) => `url(${url}) format('${format}')`)
    .join(', ')};`

  if (unicodeRange)
    result += `${spacer}unicode-range: ${unicodeRange};`

  if (comment)
    result = `/* ${comment} */\n${result}`

  return `${result}\n}`
};

function getVariableWght(axes?: any) {
  if (!axes)
    return '400'

  if (axes.min === axes.max)
    return `${axes.min}`

  return `${axes.min} ${axes.max}`
};
