import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const dir = dirname(fileURLToPath(import.meta.url))

export const targets = [
  'none',
  'windicss',
  'tailwind-jit',
  'miniwind',
]
