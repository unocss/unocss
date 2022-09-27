import { copyFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// relative to scripts directory
const destinations = [
  ['../LICENSE', '../packages/vscode/LICENSE'],
  ['../README.md', '../packages/unocss/README.md'],
]

const _filename = import.meta.url ? fileURLToPath(import.meta.url) : __filename
destinations.forEach(([src, dest]) => {
  copyFileSync(resolve(_filename, '..', src), resolve(_filename, '..', dest))
})
