import { promises as fs } from 'fs'
import { resolveModule, isPackageExists } from 'local-pkg'
import type { IconifyJSON } from '@iconify/types'

const _collections: Record<string, Promise<IconifyJSON | undefined>> = {}

const isLegacyExists = isPackageExists('@iconify/json')

export async function loadCollectionFromFS(name: string) {
  if (!_collections[name])
    _collections[name] = task()
  return _collections[name]

  async function task() {
    let jsonPath = resolveModule(`@iconify-json/${name}/icons.json`)
    if (!jsonPath && isLegacyExists)
      jsonPath = resolveModule(`@iconify/json/json/${name}.json`)

    if (jsonPath) {
      const icons = JSON.parse(await fs.readFile(jsonPath, 'utf8'))
      return icons
    }
    else {
      return undefined
    }
  }
}
