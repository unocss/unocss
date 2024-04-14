/**
 * Inspired by:
 * https://github.com/feat-agency/vite-plugin-webfont-dl/blob/master/src/downloader.ts
 */
import { $fetch } from 'ofetch'

const fontUrlRegex = /[-a-z0-9@:%_+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi

const defaultFontCssFilename = 'fonts.css'

// eslint-disable-next-line node/prefer-global/process
const isNode = typeof process !== 'undefined' && process.stdout && !process.versions.deno

interface UseLocalFontOptions {
  downloadDir: string
}

export async function useLocalFont(css: string, { downloadDir }: UseLocalFontOptions) {
  if (!isNode)
    return

  const { resolve } = await import('node:path')
  const { writeFile, mkdir } = await import('node:fs/promises')

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
  const { stat } = await import('node:fs/promises')
  const isFile = (await stat(path).catch(() => undefined))?.isFile()
  return isFile
}

async function saveFont(url: string, path: string) {
  if (await fileExists(path))
    return
  const { writeFile } = await import('node:fs/promises')
  const { Buffer } = await import('node:buffer')

  const response = await $fetch(url, { headers: { responseType: 'arraybuffer' } }) as ArrayBuffer
  const content = new Uint8Array(response)
  await writeFile(path, Buffer.from(content))
}

export async function readFontCSS(downloadDir: string) {
  if (!isNode)
    return ''

  const { resolve } = await import('node:path')
  const { readFile } = await import('node:fs/promises')

  const fontCssPath = resolve(downloadDir, defaultFontCssFilename)
  if (!await fileExists(fontCssPath))
    return '/* [preset-web-font] This code will be replaced with the local CSS once it is downloaded */'

  return await readFile(fontCssPath, { encoding: 'utf-8' })
}
