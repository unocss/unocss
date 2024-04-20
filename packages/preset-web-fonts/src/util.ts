// eslint-disable-next-line node/prefer-global/process
export const isNode = typeof process !== 'undefined' && process.stdout && !process.versions.deno

export async function resolveDownloadDir(downloadDir?: string | (() => Promise<string>)) {
  if (!isNode)
    return ''

  const { resolve } = await import('node:path')
  const { cwd } = await import('node:process')

  if (typeof downloadDir === 'function')
    return await downloadDir()
  else if (typeof downloadDir === 'string')
    return resolve(cwd(), downloadDir)
  return `${cwd()}/public/unocss-fonts`
}
