/**
 * Inspired by:
 * https://github.com/feat-agency/vite-plugin-webfont-dl/blob/master/src/downloader.ts
 */

import { mkdir, stat, writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { WebFontsOptions } from './types'

const fontUrlRegex = /[-a-z0-9@:%_+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi

const dir = dirname(fileURLToPath(import.meta.url))

const cachedUrls = new Map<string, string>()

export async function useLocalFont(css: string, fetch: WebFontsOptions['customFetch']) {
  const allUrls = css.match(fontUrlRegex)?.map(url => url.trim()) || []
  const newUrls = []
  for (const url of allUrls) {
    if (cachedUrls.has(url))
      css = css.replace(url, cachedUrls.get(url)!)
    else
      newUrls.push(url)
  }

  if (newUrls.length === 0)
    return css

  async function saveFont(url: string, path: string) {
    const response = await fetch!(url, { headers: { responseType: 'arraybuffer' } }) as ArrayBuffer
    const content = new Uint8Array(response)
    await writeFile(path, Buffer.from(content))
    return { url, path }
  }

  // FIXME Currently hardcoded to the playground folder
  const fontsFolder = resolve(dir, '../../../playground/assets/fonts')
  await mkdir(fontsFolder, { recursive: true })

  const fontAlreadyDownloaded = async (path: string) => await stat(path).then(r => r.isFile()).catch(() => false)

  const promises = []

  for (const url of newUrls) {
    const path = resolve(fontsFolder, url.split('/').pop()!)
    const ignore = await fontAlreadyDownloaded(path)
    if (ignore)
      cachedUrls.set(url, path)
    else
      promises.push(saveFont(url, path))
  }

  const localFonts = await Promise.all(promises)

  for (const localFont of localFonts) {
    css = css.replace(localFont.url, localFont.path)
    cachedUrls.set(localFont.url, localFont.path)
  }

  return css
}
