import type { IconifyJSON } from '@iconify/types'
import { loadIcon } from '@iconify/utils/lib/loader/loader'
import { searchForIcon } from '@iconify/utils/lib/loader/modern'
import type { UniversalIconLoader } from '@iconify/utils/lib/loader/types'
import { ofetch } from 'ofetch'
import supportedCollection from './collections.json'
export function createCDNLoader(cdnBase: string): UniversalIconLoader {
  const cache = new Map<string, Promise<IconifyJSON>>()

  function fetchCollection(name: string) {
    if (!supportedCollection.includes(name))
      return undefined
    if (!cache.has(name)) {
      const url = `${cdnBase}@iconify-json/${name}/icons.json`
      ofetch(url, { parseResponse: JSON.parse })
        .then((it) => {
          cache.set(name, it)
        })
        .catch((err) => {
          console.error(`Failed to load icon collection from ${url}`, err)
        })
    }
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
