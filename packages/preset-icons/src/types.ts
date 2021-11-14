import type { Awaitable } from '@unocss/core'
import type { IconifyJSON } from '@iconify/types'

export interface IconsOptions {
  /**
   * Scale related to the current font size (1em).
   *
   * @default 1
   */
  scale?: number
  /**
   * Mode of generated CSS icons.
   *
   * - `mask` - use background color and the `mask` property for monochrome icons
   * - `background-img` - use background image for the icons, colors are static
   * - `auto` - smartly decide mode between `mask` and `background-img` per icon based on its style
   *
   * @default 'auto'
   * @see https://antfu.me/posts/icons-in-pure-css
   */
  mode?: 'mask' | 'background-img' | 'auto'
  /**
   * Class prefix for matching icon rules.
   *
   * @default `i-`
   */
  prefix?: string
  /**
   * Extra CSS properties applied to the generated CSS
   *
   * @default {}
   */
  extraProperties?: Record<string, string>
  /**
   * Emit warning when missing icons are matched
   *
   * @default false
   */
  warn?: boolean
  /**
   * In Node.js environment, the preset will search for the installed iconify dataset automatically.
   * When using in the browser, this options is provided to provide dataset with custom loading mechanism.
   */
  collections?: Record<string, IconifyJSON | undefined | (() => Awaitable<IconifyJSON | undefined>)>
  /**
   * Rule layer
   *
   * @default 'icons'
   */
  layer?: string
}
