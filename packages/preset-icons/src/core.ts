import type { DynamicMatcher, Preset, Rule } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import type {
  IconifyLoaderOptions,
  UniversalIconLoader,
} from '@iconify/utils/lib/loader/types'
import { encodeSvgForCss } from '@iconify/utils/lib/svg/encode-svg-for-css'

import { mergeIconProps, trimSVG } from '@iconify/utils'
import type { CSSSVGSprites, IconsOptions } from './types'
import { createAsyncSpriteIconsFactory, createUint8ArraySprite } from './create-sprite'

const COLLECTION_NAME_PARTS_MAX = 3

export { IconsOptions }

interface GeneratedSpriteData {
  name: string
  asset: Uint8Array
}

interface PresetIcons extends Preset {
  generateCSSSVGSprites: () => AsyncIterableIterator<GeneratedSpriteData>
  createCSSSVGSprite: (collection: string) => Promise<Uint8Array | undefined>
}

export function createPresetIcons(lookupIconLoader: (options: IconsOptions) => Promise<UniversalIconLoader>) {
  return function presetIcons(options: IconsOptions = {}): Preset {
    const {
      scale = 1,
      mode = 'auto',
      prefix = 'i-',
      warn = false,
      collections: customCollections,
      extraProperties = {},
      customizations = {},
      autoInstall = false,
      layer = 'icons',
      unit,
      sprites,
    } = options

    const loaderOptions: IconifyLoaderOptions = {
      addXmlNs: true,
      scale,
      customCollections,
      autoInstall,
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

    const rules: Rule[] = [[
      /^([a-z0-9:_-]+)(?:\?(mask|bg|auto))?$/,
      createDynamicMatcher(warn, mode, loaderOptions, iconLoaderResolver),
      { layer, prefix },
    ]]

    if (sprites) {
      rules.push([
        /^([a-z0-9:_-]+)(?:\?(mask|bg|auto))?$/,
        createDynamicMatcher(warn, sprites.mode ?? mode, loaderOptions, iconLoaderResolver, sprites),
        { layer, prefix: sprites.prefix ?? 'sprite-' },
      ])
    }

    let iconLoader: UniversalIconLoader

    async function iconLoaderResolver() {
      iconLoader = iconLoader || await lookupIconLoader(options)
      return iconLoader
    }

    return <PresetIcons>{
      name: '@unocss/preset-icons',
      enforce: 'pre',
      options,
      layers: { icons: -30 },
      rules,
      generateCSSSVGSprites: createGenerateCSSSVGSprites(sprites),
      createCSSSVGSprite: createCSSSVGSpriteLoader(sprites),
    }
  }
}

export function combineLoaders(loaders: UniversalIconLoader[]) {
  return (async (...args) => {
    for (const loader of loaders) {
      if (!loader)
        continue
      const result = await loader(...args)
      if (result)
        return result
    }
  }) as UniversalIconLoader
}

function createDynamicMatcher(
  warn: boolean,
  mode: string,
  loaderOptions: IconifyLoaderOptions,
  iconLoaderResolver: () => Promise<UniversalIconLoader>,
  sprites?: CSSSVGSprites,
) {
  return <DynamicMatcher>(async ([full, body, _mode = mode]) => {
    let collection = ''
    let name = ''
    let svg: string | undefined

    const iconLoader = await iconLoaderResolver()

    const usedProps = {}
    if (body.includes(':')) {
      [collection, name] = body.split(':')
      svg = sprites
        ? await loadSvgFromSprite(collection, name, sprites, { ...loaderOptions, usedProps })
        : await iconLoader(collection, name, { ...loaderOptions, usedProps })
    }
    else {
      const parts = body.split(/-/g)
      for (let i = COLLECTION_NAME_PARTS_MAX; i >= 1; i--) {
        collection = parts.slice(0, i).join('-')
        name = parts.slice(i).join('-')
        svg = sprites
          ? await loadSvgFromSprite(collection, name, sprites, { ...loaderOptions, usedProps })
          : await iconLoader(collection, name, { ...loaderOptions, usedProps })
        if (svg)
          break
      }
    }

    if (!svg) {
      if (warn)
        warnOnce(`failed to load icon "${full}"`)
      return
    }

    let url: string
    if (sprites)
      url = `url("unocss-${collection}-sprite.svg#shapes-${name}-view")`
    else
      url = `url("data:image/svg+xml;utf8,${encodeSvgForCss(svg)}")`

    if (_mode === 'auto')
      _mode = svg.includes('currentColor') ? 'mask' : 'bg'

    if (_mode === 'mask') {
      // Thanks to https://codepen.io/noahblon/post/coloring-svgs-in-css-background-images
      return {
        '--un-icon': url,
        '-webkit-mask': 'var(--un-icon) no-repeat',
        'mask': 'var(--un-icon) no-repeat',
        '-webkit-mask-size': '100% 100%',
        'mask-size': '100% 100%',
        'background-color': 'currentColor',
        // for Safari https://github.com/elk-zone/elk/pull/264
        'color': 'inherit',
        ...usedProps,
      }
    }
    else {
      return {
        'background': `${url} no-repeat`,
        'background-size': '100% 100%',
        'background-color': 'transparent',
        ...usedProps,
      }
    }
  })
}

function createCSSSVGSpriteLoader(sprites?: CSSSVGSprites) {
  return async (collection: string) => {
    const collections = sprites?.sprites[collection]
    if (!collections)
      return undefined

    return await createUint8ArraySprite(
      collection,
      createAsyncSpriteIconsFactory(collections),
      sprites?.warn ?? false,
    )
  }
}

function createGenerateCSSSVGSprites(sprites?: CSSSVGSprites) {
  return async function* () {
    if (sprites) {
      const warn = sprites.warn ?? false
      for (const [collection, collections] of Object.entries(sprites.sprites)) {
        yield <GeneratedSpriteData>{
          name: collection,
          asset: await createUint8ArraySprite(
            collection,
            createAsyncSpriteIconsFactory(collections),
            warn,
          ),
        }
      }
    }
  }
}

async function customizeSpriteIcon(
  collection: string,
  icon: string,
  options: IconifyLoaderOptions,
  svg?: string,
) {
  if (!svg)
    return svg

  const cleanupIdx = svg.indexOf('<svg')
  if (cleanupIdx > 0)
    svg = svg.slice(cleanupIdx)

  const { transform } = options?.customizations ?? {}
  svg
      = typeof transform === 'function'
      ? await transform(svg, collection, icon)
      : svg

  if (!svg.startsWith('<svg')) {
    console.warn(
        `Custom icon "${icon}" in "${collection}" is not a valid SVG`,
    )
    return svg
  }

  return await mergeIconProps(
    options?.customizations?.trimCustomSvg === true
      ? trimSVG(svg)
      : svg,
    collection,
    icon,
    options,
    undefined,
  )
}

async function loadSvgFromSprite(
  collectionName: string,
  icon: string,
  sprites: CSSSVGSprites,
  options: IconifyLoaderOptions,
) {
  const collections = sprites.sprites[collectionName]
  if (!collections)
    return

  const collectionsArray = Array.isArray(collections)
    ? collections
    : [collections]

  for (const collection of collectionsArray) {
    if (Array.isArray(collection)) {
      for (const spriteIcon of collection) {
        if (spriteIcon.name === icon)
          return await customizeSpriteIcon(collectionName, icon, options, spriteIcon.svg)
      }
    }
    else if ('svg' in collection) {
      if (collection.name === icon)
        return await customizeSpriteIcon(collectionName, icon, options, collection.svg)
    }
    else if (typeof collection === 'function') {
      for await (const spriteIcon of collection()) {
        if (spriteIcon.name === icon)
          return await customizeSpriteIcon(collectionName, icon, options, spriteIcon.svg)
      }
    }
    else {
      for await (const spriteIcon of collection[Symbol.asyncIterator]()) {
        if (spriteIcon.name === icon)
          return await customizeSpriteIcon(collectionName, icon, options, spriteIcon.svg)
      }
    }
  }
}
