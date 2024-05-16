import { cssIdRE } from '@unocss/core'

// picomatch patterns, used with rollup's createFilter
export const defaultPipelineExclude = [cssIdRE]
export const defaultPipelineInclude = [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/]

// micromatch patterns, used in postcss plugin
export const defaultFilesystemGlobs = [
  '**/*.{html,js,ts,jsx,tsx,vue,svelte,astro,elm,php,phtml,mdx,md}',
]

/**
 * Default match includes in getMatchedPositions for IDE
 */
export const defaultIdeMatchInclude: RegExp[] = [
  // String literals
  // eslint-disable-next-line regexp/strict
  /(['"`])[^\1]*?\1/g,
  // HTML tags
  /<[^/?<>0-9$_!](?:"[^"]*"|'[^']*'|[^>])+>/g,
  // CSS directives
  /(@apply|--uno|--at-apply)[^;]*;/g,
]

/**
 * Default match includes in getMatchedPositions for IDE
 */
export const defaultIdeMatchExclude: RegExp[] = [
]
