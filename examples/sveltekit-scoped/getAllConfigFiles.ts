import { readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

export function getAllConfigFiles(dir: string): string[] {
  const files = readdirSync(dir)
  return files.filter(file => extname(file) === '.ts').map(file => join(dir, file))
}
