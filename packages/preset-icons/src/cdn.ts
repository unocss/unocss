import type { IconifyJSON } from '@iconify/types'
import { loadIcon } from '@iconify/utils/lib/loader/loader'
import { searchForIcon } from '@iconify/utils/lib/loader/modern'
import type { UniversalIconLoader } from '@iconify/utils/lib/loader/types'
import { $fetch } from 'ohmyfetch'
import supportedCollection from './collections.json'

export function createCDNLoader(cdnBase: string): UniversalIconLoader {
  const cache = new Map<string, Promise<IconifyJSON>>()

  function fetchCollection(name: string) {
    if (!supportedCollection.includes(name))
      return undefined
    if (!cache.has(name))
      cache.set(name, $fetch(`${cdnBase}@iconify-json/${name}/icons.json`))
    return cache.get(name)!
  }

  return async (collection, icon, options) => {
    let result = await loadIcon(collection, icon, options)
    if (result)
      return result

    const iconSet = await fetchCollection(collection)
    if (iconSet) {
      // possible icon names
      const ids = [
        icon,
        icon.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
        icon.replace(/([a-z])(\d+)/g, '$1-$2'),
      ]
      result = await searchForIcon(iconSet, collection, ids, options)
    }

    return result
  }
}
