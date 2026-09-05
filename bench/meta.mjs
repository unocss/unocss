import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPackageInfo } from 'local-pkg'

export const dir = dirname(fileURLToPath(import.meta.url))

export const targets = [
  'none',
  'windicss',
  'tailwindcss',
  'tailwindcss4',
  'unocss',
]

const pkgs = [
  'vite',
  'unocss',
  'windicss',
  'tailwindcss',
  'tailwindcss4',
]

export async function getVersions() {
  const versions = Object.fromEntries(await Promise.all(pkgs.map(async i => [i, (await getPackageInfo(i))?.packageJson?.version])))
  versions.unocss = JSON.parse(await readFile(resolve(dir, '../package.json'), 'utf-8')).version
  return versions
}
