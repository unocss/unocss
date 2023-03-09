import type { IconifyJSON } from '@iconify/types'
import type { IconsOptions } from '@unocss/preset-icons'
import type { UniversalIconLoader } from '@iconify/utils'
import { searchForIcon } from '@iconify/utils/lib/loader/modern'
import { combineLoaders, createPresetIcons, supportedCollection } from '@unocss/preset-icons'
import { loadIcon } from '@iconify/utils'

(() => {
  const $fetch = (url: string) => fetch(url).then(data => data.json())

  function createRuntimeLoader(cdnBase: string): UniversalIconLoader {
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

  window.__unocss_presets = Object.assign(window.__unocss_presets ?? {}, {
    presetIcons: (options: IconsOptions) => createPresetIcons(async (options) => {
      const {
        cdn,
      } = options

      const loaders: UniversalIconLoader[] = []

      if (cdn)
        loaders.push(createRuntimeLoader(cdn))

      loaders.push(loadIcon)

      return combineLoaders(loaders)
    })(options),
  })
})()
