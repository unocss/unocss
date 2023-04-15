import type { FilterPattern } from '../types'
import { cssIdRE } from './helpers'

// regex patterns, used with rollup's createFilter
export const defaultExclude: Exclude<FilterPattern, null> = [cssIdRE]
export const defaultInclude: Exclude<FilterPattern, null> = [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/]

// micromatch patterns, used in postcss plugin and createFilter
export const defaultIncludeGlobs = ['./**/*.{html,js,ts,jsx,tsx,vue,svelte,astro,elm,php,phtml,mdx,md}']
