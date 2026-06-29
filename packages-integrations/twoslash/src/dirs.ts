import { fileURLToPath } from 'node:url'

export const distDir = fileURLToPath(new URL('../dist', import.meta.url))
