import { createHash } from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import process from 'node:process'
import { join, resolve } from 'node:path'
import { Buffer } from 'node:buffer'
import { fetch } from 'ofetch'
import { replaceAsync } from '../../shared-common/src/replace-async'
import type { WebFontProcessor } from './types'

const fontUrlRegex = /[-\w@:%+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi

export interface LocalFontProcessorOptions {
  /**
   * Current working directory
   *
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Directory to cache the fonts
   *
   * @default 'node_modules/.cache/unocss/fonts'
   */
  cacheDir?: string

  /**
   * Directory to save the fonts assets
   *
   * @default 'public/assets/fonts'
   */
  fontAssetsDir?: string

  /**
   * Base URL to serve the fonts from the client
   *
   * @default '/assets/fonts'
   */
  fontServeBaseUrl?: string
}

export function createLocalFontProcessor(options?: LocalFontProcessorOptions): WebFontProcessor {
  const cwd = options?.cwd || process.cwd()

  const cacheDir = resolve(cwd, options?.cacheDir || 'node_modules/.cache/unocss/fonts')
  const fontAssetsDir = resolve(cwd, options?.fontAssetsDir || 'public/assets/fonts')
  const fontServeBaseUrl = options?.fontServeBaseUrl || '/assets/fonts'

  async function _downloadFont(url: string, assetPath: string) {
    const response = await fetch(url)
      .then(r => r.arrayBuffer())
    await fsp.mkdir(fontAssetsDir, { recursive: true })
    await fsp.writeFile(assetPath, Buffer.from(response))
  }

  const cache = new Map<string, Promise<void>>()

  function downloadFont(url: string, assetPath: string) {
    if (!cache.has(url))
      cache.set(url, _downloadFont(url, assetPath))
    return cache.get(url)
  }

  return {
    async getCSS(fonts, providers, getCSSDefault) {
      const hash = getHash(JSON.stringify(fonts))
      const cachePath = join(cacheDir, `${hash}.css`)

      if (fs.existsSync(cachePath)) {
        return fsp.readFile(cachePath, 'utf-8')
      }
      const css = await getCSSDefault(fonts, providers)

      await fsp.mkdir(cacheDir, { recursive: true })
      await fsp.writeFile(cachePath, css, 'utf-8')

      return css
    },
    async transformCSS(css) {
      return await replaceAsync(css, fontUrlRegex, async (url) => {
        const hash = getHash(url)
        const ext = url.split('.').pop()

        let name = ''
        const match1 = url.match(/\/s\/([^/]+)\//) // Google Fonts
        if (match1)
          name = match1[1].replace(/\W/g, ' ').trim().replace(/\s+/, '-').toLowerCase()

        const filename = `${[name, hash].filter(Boolean).join('-')}.${ext}`
        const assetPath = join(fontAssetsDir, filename)

        if (!fs.existsSync(assetPath)) {
          await downloadFont(url, assetPath)
        }

        return `${fontServeBaseUrl}/${filename}`
      })
    },
  }
}

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .slice(0, length)
}
