import { copyFileSync } from 'fs'
import { resolve } from 'path'

// relative to scripts directory
const destinations = [
  ['../../../README.md', '../README.md'],
]

destinations.forEach(([src, dest]) => {
  copyFileSync(resolve(__dirname, src), resolve(__dirname, dest))
})
