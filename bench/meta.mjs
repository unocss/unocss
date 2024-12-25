import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
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
  versions.unocss = (await fs.readJSON(resolve(dir, '../package.json'))).version
  return versions
}
