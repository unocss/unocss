import type { WebFontProcessor } from './types'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { replaceAsync } from '#integration/utils'
import { fetch } from 'ofetch'

const fontUrlRegex = /[-\w@:%+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi
// eslint-disable-next-line regexp/no-unused-capturing-group
const urlProtocolRegex = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/
const googleFontsNameRegex = /\/s\/([^/]+)\//
const whitespaceRegex = /\s+/
const leadingSlashesRegex = /^\/{2,}/
// Shared state between processor and Vite plugin for tracking downloaded font files
const downloadedFontsRegistry = new Map<string, Set<string>>()

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

  /**
   * Custom fetch function to provide the font data.
   */
  fetch?: typeof fetch
}

export function createLocalFontProcessor(options?: LocalFontProcessorOptions): WebFontProcessor {
  const cwd = options?.cwd || process.cwd()

  const cacheDir = resolve(cwd, options?.cacheDir || 'node_modules/.cache/unocss/fonts')
  const fontAssetsDir = resolve(cwd, options?.fontAssetsDir || 'public/assets/fonts')
  const fontServeBaseUrl = options?.fontServeBaseUrl || '/assets/fonts'
  const downloadedFiles = new Set<string>()
  downloadedFontsRegistry.set(fontAssetsDir, downloadedFiles)

  async function _downloadFont(url: string, assetPath: string) {
    const fetcher = options?.fetch ?? fetch
    const response = await fetcher(url)
      .then(r => r.arrayBuffer())
    await fsp.mkdir(fontAssetsDir, { recursive: true })
    await fsp.writeFile(assetPath, Buffer.from(response))
    downloadedFiles.add(assetPath)
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
        const match1 = url.match(googleFontsNameRegex) // Google Fonts
        if (match1)
          name = match1[1].replace(/\W/g, ' ').trim().replace(whitespaceRegex, '-').toLowerCase()

        const filename = `${[name, hash].filter(Boolean).join('-')}.${ext}`
        const assetPath = join(fontAssetsDir, filename)

        if (!fs.existsSync(assetPath)) {
          const _url = hasProtocol(url) ? url : withProtocol(url)
          await downloadFont(_url, assetPath)
        }
        else {
          downloadedFiles.add(assetPath)
        }

        return `${fontServeBaseUrl}/${filename}`
      })
    },
  }
}
/**
 * Vite plugin to ensure locally downloaded font files are copied to the build output directory
 *
 * Fixes the issue where font files are missing from `dist/` on the initial build
 *
 * @example
 * ```ts
 * import { localFontsPlugin } from '@unocss/preset-web-fonts/local'
 *
 * export default defineConfig({
 *   plugins: [UnoCSS(), localFontsPlugin()],
 * })
 * ```
 */
export function localFontsPlugin(options?: LocalFontProcessorOptions) {
  const cwd = options?.cwd || process.cwd()
  const fontAssetsDir = resolve(cwd, options?.fontAssetsDir || 'public/assets/fonts')
  const fontServeBaseUrl = options?.fontServeBaseUrl || '/assets/fonts'

  let outDir = ''

  return {
    name: 'unocss:local-fonts',
    apply: 'build' as const,
    configResolved(config: any) {
      outDir = resolve(config.root || cwd, config.build?.outDir || 'dist')
    },
    async writeBundle() {
      const downloadedFiles = downloadedFontsRegistry.get(fontAssetsDir)
      if (!downloadedFiles || downloadedFiles.size === 0)
        return

      const outputFontsDir = join(outDir, fontServeBaseUrl)
      await fsp.mkdir(outputFontsDir, { recursive: true })

      for (const filePath of downloadedFiles) {
        if (!fs.existsSync(filePath))
          continue
        const filename = filePath.split('/').pop() || filePath.split('\\').pop()
        if (!filename)
          continue
        const destPath = join(outputFontsDir, filename)
        if (!fs.existsSync(destPath)) {
          await fsp.copyFile(filePath, destPath)
        }
      }
    },
  }
}

function getHash(input: string, length = 8) {
  return createHash('sha256')
    .update(input)
    .digest('hex')
    .slice(0, length)
}

function hasProtocol(input: string) {
  return urlProtocolRegex.test(input)
}

function withProtocol(input: string, protocol = 'https://') {
  const match = input.match(leadingSlashesRegex)
  if (!match)
    return protocol + input

  return protocol + input.slice(match[0].length)
}
