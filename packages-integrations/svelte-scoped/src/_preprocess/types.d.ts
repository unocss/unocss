import type { TransformApplyOptions, TransformClassesOptions, TransformDirectivesOptions } from '../types'

export interface UnocssSveltePreprocessOptions extends TransformClassesOptions, TransformApplyOptions, TransformDirectivesOptions {
  /**
   * UnoCSS config or path to config file. If not provided, will load unocss.config.ts/js. It's recommended to use the separate config file if you are having trouble with the UnoCSS extension in VSCode.
   */
  configOrPath?: UserConfig | string
}
