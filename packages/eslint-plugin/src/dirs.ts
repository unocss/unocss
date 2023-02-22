import { fileURLToPath } from 'url'

export const distDir = fileURLToPath(new URL('../dist', import.meta.url))
