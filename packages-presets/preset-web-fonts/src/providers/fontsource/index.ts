import type { Provider, WebFontsProviders } from '../../types'
import type { FontObject, FontSourceResponse, Variable } from './types'
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
        let metadata = fontsMap.get(id)!

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

        const { subsets, weights } = metadata

        if (metadata.variable) {
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
            const url = `${host}/fontsource/fonts/${metadata.id}:vf@latest/${subset}-${font.italic ? 'wght-italic' : 'wght-normal'}.woff2`

            const fontObj: FontObject = {
              family: `${metadata.family}`,
              display: 'swap',
              style: font.italic ? 'italic' : 'normal',
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
              unicodeRange: metadata.unicodeRange[subset as keyof typeof metadata.unicodeRange],
              comment: `${metadata.id}-${subset}-wght-normal`,
            }

            css.push(generateFontFace(fontObj))
          }
        }
        else {
          const _weights = font.weights && font.weights.length > 0 ? font.weights! : weights

          for (const subset of subsets) {
            for (const weight of _weights) {
              const url = `${host}/fontsource/fonts/${
                metadata.id
              }@latest/${subset}-${weight}-${font.italic ? 'italic' : 'normal'}`

              const fontObj: FontObject = {
                family: metadata.family,
                display: 'swap',
                style: font.italic ? 'italic' : 'normal',
                weight: Number(weight),
                src: [{
                  url: `${url}.woff2`,
                  format: 'woff2',
                }],
                unicodeRange: metadata.unicodeRange[subset as keyof typeof metadata.unicodeRange],
                comment: `${metadata.id}-${subset}-${weight}${
                  font.italic ? '-italic' : '-normal'
                }`,
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
