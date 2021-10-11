import { createHash } from 'crypto'

export function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}

export const defaultExclude = [/[\/\\]node_modules[\/\\]/, /[\/\\]dist[\/\\]/]
export const defaultInclude = [/\.vue$/, /\.vue?vue/, /\.svelte$/, /\.[jt]sx$/, /\.mdx?$/]
