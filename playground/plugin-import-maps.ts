import fs from 'node:fs'
import type { Plugin } from 'vite'
import fg from 'fast-glob'

const ignores = [
  'vscode',
  'cli',
  'astro',
  'nuxt',
  'postcss',
  'webpack',
  'vite',
  'inspector',
  'eslint',
]

export function importMapsPlugin(): Plugin {
  const packages = fg.sync('../packages/*/package.json', { absolute: true })
    .map(p => JSON.parse(fs.readFileSync(p, 'utf-8')).name)
    .filter(p => !ignores.some(i => p.includes(i)))

  return {
    enforce: 'pre',
    name: 'vite-plugin-inject-import-maps',
    transformIndexHtml(html) {
      const customScript = `
const packages = ${JSON.stringify(packages)}
const r = (packageName, version) => {
  let link = 'https://esm.run/' + packageName
  if (version && version !== 'latest') {
    return link + '@' + version
  }
  return link
}
const updateImportMap = async (newVersion) => {
  const map = Object.fromEntries(packages.map(p => [p, r(p, newVersion)]))
  const script = document.createElement('script')
  script.setAttribute('type', 'importmap')
  script.textContent = JSON.stringify(map, null, 2)
  const head = document.head
  head.insertBefore(script, head.firstChild)
}
const version = new URL(window.location.href).searchParams.get('version')
updateImportMap(version)
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
