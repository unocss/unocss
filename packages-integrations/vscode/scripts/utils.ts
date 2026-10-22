import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const dir = typeof __dirname === 'string' ? __dirname : dirname(fileURLToPath(import.meta.url))
export const vscodeRoot = dirname(dir)

export async function readPackage() {
  const pkgPath = join(vscodeRoot, 'package.json')
  const rawJSON = await readFile(pkgPath, 'utf-8')
  return { pkgPath, rawJSON, pkg: JSON.parse(rawJSON) }
}

export async function withTempName<T>(rawJSON: string, fn: () => Promise<T>): Promise<T> {
  const pkgPath = join(vscodeRoot, 'package.json')
  const pkg = JSON.parse(rawJSON)
  pkg.name = 'unocss'
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')

  try {
    return await fn()
  }
  finally {
    await writeFile(pkgPath, rawJSON, 'utf-8')
  }
}
