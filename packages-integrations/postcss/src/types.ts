import type { UserConfig } from '@unocss/core'

export interface UnoPostcssPluginOptions {
  content?: (string | {
    raw: string
    extension: string
  })[]
  directiveMap?: {
    apply?: string
    screen?: string
    theme?: string
    unocss?: string
  }
  cwd?: string
  configOrPath?: string | UserConfig
}
