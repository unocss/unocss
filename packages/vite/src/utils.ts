import { createHash } from 'crypto'

export const defaultExclude = [/[\/\\]node_modules[\/\\]/, /[\/\\]dist[\/\\]/, /\.(css|postcss|sass|scss|less|stylus|styl)$/]
export const defaultInclude = [/\.vue$/, /\.vue\?vue/, /\.svelte$/, /\.[jt]sx$/, /\.mdx?$/]

export function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .substr(0, length)
}
