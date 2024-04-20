/**
 * Inspired by:
 * https://github.com/feat-agency/vite-plugin-webfont-dl/blob/master/src/downloader.ts
 */
import process from 'node:process'
import { resolve } from 'node:path'
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { $fetch } from 'ofetch'
import { resolveDownloadDir } from './util'

const fontUrlRegex = /[-a-z0-9@:%_+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi

const defaultFontCssFilename = 'fonts.css'

const isNode = typeof process !== 'undefined' && process.stdout && !process.versions.deno

interface UseLocalFontOptions {
  downloadDir: string
}

export { resolveDownloadDir }

export async function useLocalFont(css: string, { downloadDir }: UseLocalFontOptions) {
  if (!isNode)
    return

  await mkdir(downloadDir, { recursive: true })

  // Download the fonts locally and update the font.css file
  for (const url of css.match(fontUrlRegex) || []) {
    const path = resolve(downloadDir, url.split('/').pop()!)
    await saveFont(url, path)
    css = css.replaceAll(url, path)
  }

  // Save the updated font.css file
  const fontCssPath = resolve(downloadDir, defaultFontCssFilename)
  await writeFile(fontCssPath, css)
}

async function fileExists(path: string) {
  return await lstat(path).then(({ isFile }) => isFile()).catch(() => false)
}

async function saveFont(url: string, path: string) {
  if (await fileExists(path))
    return
  const response = await $fetch(url, { headers: { responseType: 'arraybuffer' } }) as ArrayBuffer
  const content = new Uint8Array(response)
  await writeFile(path, Buffer.from(content))
}

export async function readFontCSS(downloadDir: string) {
  if (!isNode)
    return ''

  const fontCssPath = resolve(downloadDir, defaultFontCssFilename)
  if (!await fileExists(fontCssPath))
    return '/* [preset-web-font] This code will be replaced with the local CSS once it is downloaded */'

  return await readFile(fontCssPath, { encoding: 'utf-8' })
}
