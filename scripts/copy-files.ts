import { copyFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve } from 'pathe'

// relative to scripts directory
const destinations = [
  ['../LICENSE', '../packages/vscode/LICENSE'],
  ['../README.md', '../packages/unocss/README.md'],
]

const _filename = import.meta.url ? fileURLToPath(import.meta.url) : __filename
destinations.forEach(([src, dest]) => {
  copyFileSync(resolve(_filename, '..', src), resolve(_filename, '..', dest))
})
