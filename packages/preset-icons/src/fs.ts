import { promises as fs } from 'fs'
import { resolveModule } from 'local-pkg'
import type { IconifyJSON } from '@iconify/types'

const _collections: Record<string, IconifyJSON | false> = {}

export async function loadCollectionFromFS(name: string): Promise<IconifyJSON | undefined> {
  if (_collections[name] === false)
    return

  if (_collections[name])
    return _collections[name] as IconifyJSON

  const jsonPath = resolveModule(`@iconify-json/${name}/icons.json`)
  if (jsonPath) {
    const icons = JSON.parse(await fs.readFile(jsonPath, 'utf8'))
    _collections[name] = icons
    return icons
  }
  else {
    _collections[name] = false
    return undefined
  }
}
