import type { Plugin } from 'vite'

export function importMapsPlugin(): Plugin {
  return {
    enforce: 'pre',
    name: 'vite-plugin-inject-import-maps',
    transformIndexHtml(html) {
      const customScript = `
          const r = (packageName, version) => {
            return \`https://esm.sh/\${packageName}@\${version}\`
          }
          const updateImportMap = (newImportsVersion) => {
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
              document.head.appendChild(script)
          }
          const version = new URL(window.location.href).searchParams.get('version') || '0.61.5'
          if (version) {
            updateImportMap(version)
          }
      `
      return {
        html,
        tags: [
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
