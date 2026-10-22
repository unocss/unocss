import type { Plugin } from 'vite'

const CDN_BASE = 'https://esm.sh/'

const BABEL_HELPER_GLOBALS_IMPORT_MAPS = [
  '@babel/helper-globals/data/builtin-lower.json',
  '@babel/helper-globals/data/builtin-upper.json',
]

export function importMapPlugin(): Plugin {
  return {
    name: 'import-map-plugin',
    apply: 'build',
    transformIndexHtml(html: string) {
      // Create import map script tag
      const importMapScript = `<script type="importmap">
{
  "imports": ${JSON.stringify(BABEL_HELPER_GLOBALS_IMPORT_MAPS.reduce<Record<string, string>>(
    (acc, cur) => {
      acc[cur] = `${CDN_BASE}${cur}`
      return acc
    },
    {},
  ), null, 2)}
}
</script>`

      // Insert the import map before any other scripts
      return html.replace(
        /<head>/,
        `<head>\n${importMapScript}`,
      )
    },
  }
}
