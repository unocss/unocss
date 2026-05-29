import type { Provider, WebFontsProviders } from '../types'

function parseFontName(name: string): { family: string, id: string } {
  const atIndex = name.lastIndexOf('@')
  if (atIndex === -1) {
    throw new Error(
      `[unocss] ZeoSeven provider requires font ID in format "FontFamily@id", e.g. "LXGW WenKai@292". Got: "${name}"`,
    )
  }
  return {
    family: name.slice(0, atIndex).trim(),
    id: name.slice(atIndex + 1).trim(),
  }
}

export function createZeoSevenProvider(name: WebFontsProviders, host: string): Provider {
  return {
    name,
    getFontName(font) {
      const { family } = parseFontName(font.name)
      return `"${family}"`
    },
    async getPreflight(fonts, fetcher) {
      const cssParts: string[] = []

      for (const font of fonts) {
        const { id } = parseFontName(font.name)
        const baseUrl = `${host}/${id}/main/`
        const url = `${baseUrl}result.css`

        try {
          const result = await fetcher(url) as string
          const processed = result.replace(
            /url\("\.\/([^"]+)"\)/g,
            `url("${baseUrl}$1")`,
          )
          cssParts.push(processed)
        }
        catch {
          throw new Error(`[unocss] Failed to fetch ZeoSeven font CSS for ID "${id}"`)
        }
      }

      return cssParts.join('\n')
    },
  }
}

export const ZeoSevenFontsProvider: Provider = createZeoSevenProvider(
  'zeoseven',
  'https://fontsapi.zeoseven.com',
)
