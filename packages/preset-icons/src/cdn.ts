import type { IconifyJSON } from '@iconify/types'
import { loadIcon } from '@iconify/utils/lib/loader/loader'
import { searchForIcon } from '@iconify/utils/lib/loader/modern'
import type { UniversalIconLoader } from '@iconify/utils/lib/loader/types'
import { $fetch } from 'ohmyfetch'

// TODO: load dynamically from somewhere
const supportedCollection = ['material-symbols', 'ic', 'mdi', 'ph', 'ri', 'carbon', 'bi', 'tabler', 'ion', 'uil', 'teenyicons', 'clarity', 'iconoir', 'majesticons', 'zondicons', 'ant-design', 'bx', 'bxs', 'gg', 'cil', 'lucide', 'pixelarticons', 'system-uicons', 'ci', 'akar-icons', 'typcn', 'radix-icons', 'ep', 'mdi-light', 'fe', 'eos-icons', 'line-md', 'charm', 'prime', 'heroicons-outline', 'heroicons-solid', 'uiw', 'uim', 'uit', 'uis', 'maki', 'gridicons', 'mi', 'quill', 'gala', 'fluent', 'icon-park-outline', 'icon-park', 'vscode-icons', 'jam', 'codicon', 'pepicons', 'bytesize', 'ei', 'fa6-solid', 'fa6-regular', 'octicon', 'ooui', 'nimbus', 'openmoji', 'twemoji', 'noto', 'noto-v1', 'emojione', 'emojione-monotone', 'emojione-v1', 'fxemoji', 'bxl', 'logos', 'simple-icons', 'cib', 'fa6-brands', 'arcticons', 'file-icons', 'brandico', 'entypo-social', 'cryptocurrency', 'flag', 'circle-flags', 'flagpack', 'cif', 'gis', 'map', 'geo', 'fad', 'academicons', 'wi', 'healthicons', 'medical-icon', 'la', 'eva', 'dashicons', 'flat-color-icons', 'entypo', 'foundation', 'raphael', 'icons8', 'iwwa', 'fa-solid', 'fa-regular', 'fa-brands', 'fa', 'fontisto', 'icomoon-free', 'ps', 'subway', 'oi', 'wpf', 'simple-line-icons', 'et', 'el', 'vaadin', 'grommet-icons', 'whh', 'si-glyph', 'zmdi', 'ls', 'bpmn', 'flat-ui', 'vs', 'topcoat', 'il', 'websymbol', 'fontelico', 'feather', 'mono-icons']

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
