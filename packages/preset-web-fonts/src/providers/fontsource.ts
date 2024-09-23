import type { Provider, WebFontsProviders } from '../types'

const fetchedMap = new Map<string, Promise<string>>()

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
  return {
    name,
    async getPreflight(fonts) {
      return ''
    },
  }
}

export const FontSourceProvider: Provider = createFontSourceProvider('fontsource', 'https://cdn.jsdelivr.net')
