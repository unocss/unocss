import { cssIdRE } from '@unocss/core'

// picomatch patterns, used with rollup's createFilter
export const defaultPipelineExclude = [cssIdRE]
export const defaultPipelineInclude = [/\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/]

// micromatch patterns, used in postcss plugin
export const defaultFilesystemGlobs = [
  '**/*.{html,js,ts,jsx,tsx,vue,svelte,astro,elm,php,phtml,mdx,md}',
]
