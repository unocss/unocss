import type { Axes } from '../../types'

export type Subset = 'cyrillic' | 'cyrillic-ext' | 'greek' | 'greek-ext' | 'hebrew' | 'latin' | 'latin-ext' | 'math' | 'symbols' | 'vietnamese'
export type Style = 'italic' | 'normal'
export type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type Format = 'woff2' | 'woff' | 'ttf'

export interface FontSourceResponse {
  id: string
  family: string
  weights: Weight[]
  styles: Style[]
  variable: boolean
  unicodeRange: Record<Subset, string>
  subsets: Subset[]
  defSubset: Subset
  variants: Record<Weight, Record<Style, Record<Subset, Record<'url', Record<Format, string>>>>>
  lastModified: string
  version: string
  category: string
  license: string
  source: string
  type: string
  npmVersion: string
}

export interface Variable {
  axes: {
    wght?: Axes
    wdth?: Axes
    slnt?: Axes
    ital?: Axes
  }
  family: string
}

export interface Source {
  url: string
  format: 'woff2' | 'woff' | 'woff2-variations' | string
}

export interface FontObject {
  family: string
  style: string
  display: string
  weight: number
  src: Source[]
  variable?: Variable['axes']
  unicodeRange?: string
  comment?: string
  spacer?: string
}
