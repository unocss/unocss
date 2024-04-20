/**
 * Inspired by:
 * https://github.com/feat-agency/vite-plugin-webfont-dl/blob/master/src/downloader.ts
 */
import { resolveDownloadDir } from './util'

const fontUrlRegex = /[-a-z0-9@:%_+.~#?&/=]+\.(?:woff2?|eot|ttf|otf|svg)/gi

const defaultFontCssFilename = 'fonts.css'

interface UseLocalFontOptions {
  downloadDir: string
  downloadBasePath: string
}

export { resolveDownloadDir }

export async function useLocalFont(css: string, { downloadDir, downloadBasePath }: UseLocalFontOptions) {
  const [{ mkdir, writeFile }, { resolve }] = await Promise.all([
    import('node:fs/promises'),
    import('node:path'),
  ])
  await mkdir(downloadDir, { recursive: true })

  // Download the fonts locally and update the font.css file
  for (const url of css.match(fontUrlRegex) || []) {
    const name = url.split('/').pop()!
    await saveFont(url, resolve(downloadDir, name))
    css = css.replaceAll(url, `${downloadBasePath}${name}`)
  }

  // Save the updated font.css file
  const fontCssPath = resolve(downloadDir, defaultFontCssFilename)
  await writeFile(fontCssPath, css)
}

async function fileExists(path: string) {
  const { lstat } = await import('node:fs/promises')
  return await lstat(path).then(({ isFile }) => isFile()).catch(() => false)
}

async function saveFont(url: string, path: string) {
  if (await fileExists(path))
    return

  const [{ writeFile }, { $fetch }, { Buffer }] = await Promise.all([
    import('node:fs/promises'),
    import('ofetch'),
    import('node:buffer'),
  ])
  const response = await $fetch(url, { headers: { responseType: 'arraybuffer' } }) as ArrayBuffer
  const content = new Uint8Array(response)
  await writeFile(path, Buffer.from(content))
}

export async function readFontCSS(downloadDir: string) {
  const [{ resolve }, { readFile }] = await Promise.all([
    import('node:path'),
    import('node:fs/promises'),
  ])
  const fontCssPath = resolve(downloadDir, defaultFontCssFilename)
  if (!await fileExists(fontCssPath))
    return '/* [preset-web-font] This code will be replaced with the local CSS once it is downloaded */'

  return await readFile(fontCssPath, { encoding: 'utf-8' })
}
