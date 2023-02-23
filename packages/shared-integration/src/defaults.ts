import { cssIdRE } from '@unocss/core'

// picomatch patterns, used with rollup's createFilter
export const defaultExclude = [cssIdRE]
export const defaultInclude = [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/]

// micromatch patterns, used in postcss plugin
export const defaultIncludeGlobs = ['**/*.{html,js,ts,jsx,tsx,vue,svelte,astro,elm,php,phtml,mdx,md}']
