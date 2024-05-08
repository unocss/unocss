// eslint-disable-next-line node/prefer-global/process
export const isNode = typeof process !== 'undefined' && process.stdout && !process.versions.deno

export async function resolveDownloadDir(downloadDir?: string | (() => string)) {
  if (!isNode)
    return ''

  if (typeof downloadDir === 'function')
    return downloadDir()

  const { resolve } = await import('node:path')
  const { cwd } = await import('node:process')

  return typeof downloadDir === 'string' ? resolve(cwd(), downloadDir) : `${cwd()}/public/unocss-fonts`
}
