import type { Plugin } from 'vite'

export function importMapsPlugin(): Plugin {
  return {
    enforce: 'pre',
    name: 'vite-plugin-inject-import-maps',
    transformIndexHtml(html) {
      const customScript = `
const r = (packageName, version) => {
  if(version) {
    return \`https://esm.run\${packageName}@\${version}\`
  }
  return \`https://esm.run\${packageName}\`
}
const updateImportMap = async (newImportsVersion) => {
  const map = {
    imports: {
      '@unocss/autocomplete': r('@unocss/autocomplete', newImportsVersion),
      '@unocss/core': r('@unocss/core', newImportsVersion),
      '@unocss/preset-rem-to-px': r('@unocss/preset-rem-to-px', newImportsVersion),
      '@unocss/extractor-arbitrary-variants': r('@unocss/extractor-arbitrary-variants', newImportsVersion),
      '@unocss/transformer-attributify-jsx-babel': r('@unocss/transformer-attributify-jsx-babel', newImportsVersion),
      'unocss': r('unocss', newImportsVersion),
      '@unocss/vite': r('@unocss/vite', newImportsVersion),
    }
  }
    const script = document.createElement('script')
    script.setAttribute('type','importmap')
    script.textContent = JSON.stringify(map, null, 2)
    const head = document.head
    head.insertBefore(script, head.firstChild)
}
const url = new URL(window.location.href).searchParams.get('version')
const version = LZString.decompressFromEncodedURIComponent(url) || ''
updateImportMap(version)
      `
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              src: 'https://cdn.jsdelivr.net/npm/lz-string',
            },
            injectTo: 'head-prepend',
          },
          {
            tag: 'script',
            children: customScript,
            injectTo: 'head-prepend',
          },
        ],
      }
    },
  }
}
