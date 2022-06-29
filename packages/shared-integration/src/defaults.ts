import { cssIdRE } from '@unocss/core'

export const defaultExclude = [cssIdRE, /\.d\.ts$/]
export const defaultInclude = [/\.vue$/, /\.vue\?vue/, /\.svelte$/, /\.[jt]sx$/, /\.mdx?$/, /\.astro$/, /\.elm$/]
