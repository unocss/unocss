import type { IconifyJSON } from '@iconify/types'
import type { CustomIconLoader, IconCustomizations, InlineCollection } from '@iconify/utils'
import type { Awaitable, CSSObject } from '@unocss/core'

interface IconMeta {
  collection: string
  name: string
  svg: string
  mode?: IconsOptions['mode']

  /**
   * @deprecated renamed to `name`
   */
  icon: string
}

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
  mode?: 'mask' | 'bg' | 'auto'

  /**
   * Class prefix for matching icon rules.
   *
   * @default `i-`
   */
  prefix?: string | string[]

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
   * `@iconify-json` collections to use (will be also auto installed when missing and `autoInstall` enabled).
   *
   * This option should be used only when there are new `@iconify-json` collections not listed in the default icons preset collection names.
   *
   * Adding external collections will not work, you should use `FileSystemIconLoader` from
   * `@iconify/utils/lib/loader/fs` or `createExternalPackageIconLoader` from
   * `@iconify/utils/lib/loader/external-pkg` instead.
   *
   * @see https://unocss.dev/presets/icons#filesystemiconloader
   * @see https://unocss.dev/presets/icons#externalpackageiconloader
   */
  iconifyCollectionsNames?: string[]

  /**
   * In Node.js environment, the preset will search for the installed iconify dataset automatically.
   * When using in the browser, this options is provided to provide dataset with custom loading mechanism.
   */
  collections?: Record<string, (() => Awaitable<IconifyJSON>) | undefined | CustomIconLoader | InlineCollection>

  /**
   * Rule layer
   *
   * @default 'icons'
   */
  layer?: string

  /**
   * Custom icon customizations.
   */
  customizations?: Omit<IconCustomizations, 'additionalProps' | 'trimCustomSvg'>

  /**
   * Auto install icon sources package when the usages is detected
   *
   * Only effective in Node.js environment.
   *
   * @default false
   */
  autoInstall?: boolean

  /**
   * Path to resolve the iconify collections in Node.js environment.
   *
   * @default process.cwd()
   */
  collectionsNodeResolvePath?: string | string[]

  /**
   * Custom icon unit.
   *
   * @default `em`
   */
  unit?: string

  /**
   * Load icons from CDN. Should starts with `https://` and ends with `/`
   *
   * Recommends:
   * - https://esm.sh/
   * - https://cdn.skypack.dev/
   */
  cdn?: string

  /**
   * Custom fetch function to provide the icon data.
   */
  customFetch?: (url: string) => Promise<any>

  /**
   * Processor for the CSS object before stringify
   */
  processor?: (cssObject: CSSObject, meta: Required<IconMeta>) => void
}
