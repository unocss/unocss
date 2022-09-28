import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { getPackageInfo } from 'local-pkg'
import fs from 'fs-extra'

export const dir = dirname(fileURLToPath(import.meta.url))

export const targets = [
  'none',
  'windicss',
  'tailwindcss',
  'unocss',
]

const pkgs = [
  'vite',
  'unocss',
  'windicss',
  'tailwindcss',
]

export async function getVersions() {
  const versions = Object.fromEntries(await Promise.all(pkgs.map(async i => [i, (await getPackageInfo(i))?.packageJson?.version])))
  versions.unocss = (await fs.readJSON(resolve(dir, '../package.json'))).version
  return versions
}
