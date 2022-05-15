import { copyFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// relative to scripts directory
const destinations = [
  ['../LICENSE', '../packages/vscode/LICENSE'],
  ['../README.md', '../packages/unocss/README.md'],
]

const __filename = fileURLToPath(import.meta.url)
destinations.forEach(([src, dest]) => {
  copyFileSync(resolve(__filename, '..', src), resolve(__filename, '..', dest))
})
