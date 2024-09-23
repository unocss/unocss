import type { Provider, WebFontsProviders } from '../types'

type Subset = 'cyrillic' | 'cyrillic-ext' | 'greek' | 'greek-ext' | 'latin' | 'latin-ext' | 'vietnamese'
type Style = 'italic' | 'normal'
type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

interface Url {
  woff2: string
  woff: string
  ttf: string
}

interface FontSourceResult {
  id: string
  family: string
  weights: Weight[]
  styles: Style[]
  variable: boolean // is variable font
  unicodeRange: Record<Subset, string>
  subsets: Subset[]
  defSubset: Subset
  variants: Record<Weight, Record<Style, Record<Subset, Record<'url', Url>>>>

  lastModified: string
  version: string
  category: string
  license: string
  source: string
  type: string
  npmVersion: string
}

export function createFontSourceProvider(name: WebFontsProviders, host: string): Provider {
  const fontsMap = new Map<string, FontSourceResult>()

  return {
    name,
    async getPreflight(fonts) {
      let css: string | undefined

      const list = await Promise.all(fonts.map(async (font) => {
        const id = font.name.toLowerCase().replace(/\s+/g, '-')
        let data = fontsMap.get(id)!

        if (!data) {
          const url = `https://api.fontsource.org/v1/fonts/${id}`
          try {
            data = await (await import('ofetch')).$fetch<FontSourceResult>(url)
            fontsMap.set(id, data)
          }
          catch {
            throw new Error(`Failed to fetch font: ${font.name}`)
          }
        }

        if (data.variable) {
          if (font.italic) {

          }
          else {

          }
        }
        else {

        }

        return fontsMap.get(id)
      }))

      return css
    },
  }
}

export const FontSourceProvider: Provider = createFontSourceProvider('fontsource', 'https://cdn.jsdelivr.net')

function generateFontFace(metadata: {
  id: string
  family: string
  weight: string
  style: Style
  unicodeRange: string
  variable: boolean
  cdn: string
  subset: string
}) {
  const {
    id,
    family,
    weight,
    style,
    unicodeRange,
    variable,
    cdn,
    subset,
  } = metadata

  const src = variable
    ? `url(${cdn}/fontsource/fonts/${id}:vf@latest/${subset}-wght-${style}.woff2) format('woff2-variations')`
    : `url(${cdn}/fontsource/fonts/${id}@latest/${style}.woff2`

  return `
/* source-code-pro-latin-wght-normal */
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-display: ${variable ? 'block' : 'swap'};
  font-weight: 200 900;
  src: url(https://cdn.jsdelivr.net/fontsource/fonts/source-code-pro:vf@latest/-wght-normal.woff2) format('woff2-variations');
  unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
`.trim()
}
