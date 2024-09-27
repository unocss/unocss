import type { IconifyLoaderOptions, UniversalIconLoader } from '@iconify/utils'
import type { Preset, UnoGenerator } from '@unocss/core'
import type { IconsOptions } from '@unocss/preset-icons'
import { encodeSvgForCss } from '@iconify/utils'
import { toArray } from '@unocss/core'

const COLLECTION_NAME_PARTS_MAX = 3

// eslint-disable-next-line regexp/no-super-linear-backtracking
export const iconFnRE = /icon\(\s*(['"])?(.*?)\1?\s*\)/g

export function hasIconFn(str: string) {
  return str.includes('icon(') && str.includes(')')
}

export async function transformIconString(uno: UnoGenerator, icon: string, color?: string) {
  const presetIcons = uno.userConfig.presets?.flat()?.findLast(i => i.name === '@unocss/preset-icons')

  if (!presetIcons) {
    console.warn('@unocss/preset-icons not found')
    return
  }

  const {
    scale = 1,
    prefix = 'i-',
    collections: customCollections,
    extraProperties = {},
    customizations = {},
    autoInstall = false,
    collectionsNodeResolvePath,
    unit,
  } = (presetIcons as Preset).options as IconsOptions

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
      additionalProps: { ...extraProperties },
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

  const loader = await createNodeLoader()

  for (const p of toArray(prefix)) {
    if (icon.startsWith(p)) {
      icon = icon.slice(p.length)
      const parsed = await parseIcon(icon, loader, loaderOptions)
      if (parsed)
        return `url("data:image/svg+xml;utf8,${color ? encodeSvgForCss(parsed.svg).replace(/currentcolor/gi, color) : encodeSvgForCss(parsed.svg)}")`
    }
  }
}

export async function createNodeLoader() {
  try {
    return await import('@iconify/utils/lib/loader/node-loader').then(i => i?.loadNodeIcon)
  }
  catch { }
  try {
    // eslint-disable-next-line ts/no-require-imports
    return require('@iconify/utils/lib/loader/node-loader.cjs').loadNodeIcon
  }
  catch { }
}

export async function parseIcon(body: string, loader: UniversalIconLoader, options: IconifyLoaderOptions = {}) {
  let collection = ''
  let name = ''
  let svg: string | undefined

  if (body.includes(':')) {
    [collection, name] = body.split(':')
    svg = await loader(collection, name, options)
  }
  else {
    const parts = body.split(/-/g)
    for (let i = COLLECTION_NAME_PARTS_MAX; i >= 1; i--) {
      collection = parts.slice(0, i).join('-')
      name = parts.slice(i).join('-')
      svg = await loader(collection, name, options)
      if (svg)
        break
    }
  }

  if (!svg) {
    return
  }

  return {
    collection,
    name,
    svg,
  }
}
