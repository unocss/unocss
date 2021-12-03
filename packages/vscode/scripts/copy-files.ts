import { copyFileSync } from 'fs'
import { resolve } from 'path'

// relative to scripts directory
const destinations = [
  ['../../../LICENSE', '../LICENSE'],
]

destinations.forEach(([src, dest]) => {
  copyFileSync(resolve(__dirname, src), resolve(__dirname, dest))
})
