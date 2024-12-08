import type { IconifyLoaderOptions, UniversalIconLoader } from '@iconify/utils'
import type { Preset, UnoGenerator } from '@unocss/core'
import type { IconsAPI, IconsOptions } from '@unocss/preset-icons'
import { toArray } from '@unocss/core'

export async function transformIconString(uno: UnoGenerator, icon: string, color?: string) {
  const presetIcons = uno.config.presets?.flat()?.find(i => i.name === '@unocss/preset-icons') as Preset | undefined

  if (!presetIcons) {
    console.warn('@unocss/preset-icons not found, icon() directive will be keep as-is')
    return
  }

  const {
    scale = 1,
    prefix = 'i-',
    collections: customCollections,
    customizations = {},
    autoInstall = false,
    iconifyCollectionsNames,
    collectionsNodeResolvePath,
    unit,
  } = presetIcons.options as IconsOptions

  const api = presetIcons.api as IconsAPI

  const loaderOptions: IconifyLoaderOptions = {
    addXmlNs: true,
    scale,
    customCollections,
    autoInstall,
    cwd: collectionsNodeResolvePath,
    // avoid warn from @iconify/loader: we'll warn below if not found
    warn: undefined,
    customizations: {
      ...customizations,
      trimCustomSvg: true,
      async iconCustomizer(collection, icon, props) {
        await customizations.iconCustomizer?.(collection, icon, props)
        if (unit) {
          if (!props.width)
            props.width = `${scale}${unit}`
          if (!props.height)
            props.height = `${scale}${unit}`
        }
      },
    },
  }

  const loader: UniversalIconLoader = await api.createNodeLoader?.() || (async () => undefined)

  for (const p of toArray(prefix)) {
    if (icon.startsWith(p)) {
      icon = icon.slice(p.length)
      const parsed = await api.parseIconWithLoader(
        icon,
        loader,
        loaderOptions,
        iconifyCollectionsNames,
      )
      if (parsed)
        return `url("data:image/svg+xml;utf8,${color ? api.encodeSvgForCss(parsed.svg).replace(/currentcolor/gi, color) : api.encodeSvgForCss(parsed.svg)}")`
    }
  }
}
