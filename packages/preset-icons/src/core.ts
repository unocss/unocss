import type { Preset } from '@unocss/core'
import { warnOnce } from '@unocss/core'
import type {
  IconifyLoaderOptions,
  UniversalIconLoader,
} from '@iconify/utils/lib/loader/types'
import { encodeSvgForCss } from '@iconify/utils/lib/svg/encode-svg-for-css'
import type { IconsOptions } from './types'

const COLLECTION_NAME_PARTS_MAX = 3

export { IconsOptions }

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

    let iconLoader: UniversalIconLoader

    return {
      name: '@unocss/preset-icons',
      enforce: 'pre',
      options,
      layers: { icons: -30 },
      rules: [[
        /^([a-z0-9:_-]+)(?:\?(mask|bg|auto))?$/,
        async ([full, body, _mode = mode]) => {
          let collection = ''
          let name = ''
          let svg: string | undefined

          iconLoader = iconLoader || await lookupIconLoader(options)

          const usedProps = {}
          if (body.includes(':')) {
            [collection, name] = body.split(':')
            svg = await iconLoader(collection, name, { ...loaderOptions, usedProps })
          }
          else {
            const parts = body.split(/-/g)
            for (let i = COLLECTION_NAME_PARTS_MAX; i >= 1; i--) {
              collection = parts.slice(0, i).join('-')
              name = parts.slice(i).join('-')
              svg = await iconLoader(collection, name, { ...loaderOptions, usedProps })
              if (svg)
                break
            }
          }

          if (!svg) {
            if (warn)
              warnOnce(`failed to load icon "${full}"`)
            return
          }

          const url = `url("data:image/svg+xml;utf8,${encodeSvgForCss(svg)}")`

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
        },
        { layer, prefix },
      ]],
    }
  }
}

export function combineLoaders(loaders: UniversalIconLoader[]) {
  return <UniversalIconLoader>(async (...args) => {
    for (const loader of loaders) {
      const result = await loader(...args)
      if (result)
        return result
    }
  })
}
