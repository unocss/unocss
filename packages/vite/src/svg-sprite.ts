import type { Preset, UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import type { OutputAsset } from 'rollup'

const ENTRY_ALIAS = /^unocss-(.*)-sprite\.svg$/

interface GeneratedSpriteData {
  name: string
  asset: Uint8Array
}

interface PresetIcons extends Preset {
  generateCSSSVGSprites: () => AsyncIterableIterator<GeneratedSpriteData>
  createCSSSVGSprite: (collection: string) => Promise<Uint8Array | undefined>
}

interface SpritesInfo {
  cssFiles: OutputAsset[]
  svgFiles: [name: string, fileName: string, find: string][]
}

interface SpriteData {
  name: string
  asset: Uint8Array
  lastModified: number
}

export function SVGSpritePlugin(ctx: UnocssPluginContext): Plugin[] {
  const sprites = new Map<string, SpriteData>()
  return [{
    name: 'unocss:css-svg-sprite:dev',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      ctx.onReload(() => sprites.clear())
      server.middlewares.use(async (req, res, next) => {
        const uri = req.url
        if (!uri)
          return next()

        let pathname = new URL(uri, 'http://localhost').pathname
        if (pathname.startsWith(server.config.base))
          pathname = pathname.slice(server.config.base.length)

        const match = pathname.match(ENTRY_ALIAS)
        if (!match)
          return next()

        const preset = await lookupPresetIcons(ctx)
        if (!preset)
          return next()

        let sprite = sprites.get(match[1])
        let status = 200
        const lastModified = sprite?.lastModified ?? Date.now()
        if (!sprite) {
          const spriteData = await preset.createCSSSVGSprite(match[1])
          if (spriteData) {
            sprite = {
              name: match[1],
              asset: spriteData,
              lastModified,
            }
            sprites.set(match[1], sprite)
          }
        }
        else {
          status = req.headers['if-modified-since'] === `${lastModified}` ? 304 : 200
        }

        const now = Date.now()
        res.setHeader('Content-Type', 'image/svg+xml')
        if (sprite) {
          res.statusCode = status
          if (now > lastModified)
            res.setHeader('Age', Math.floor((now - lastModified) / 1000))

          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
          res.setHeader('Last-Modified', `${lastModified}`)
          if (status !== 304)
            res.write(sprite.asset)
        }
        else {
          res.statusCode = 404
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
        }
        res.end()
      })
    },
  }, {
    name: 'unocss:css-svg-sprite:build',
    enforce: 'post',
    apply: 'build',
    async buildStart() {
      const preset = await lookupPresetIcons(ctx)
      if (!preset)
        return

      for await (const sprite of preset.generateCSSSVGSprites()) {
        const { asset, name } = sprite
        const assetName = `unocss-${name}-sprite.svg`
        this.emitFile({
          type: 'asset',
          name: assetName,
          source: asset,
        })
        sprites.set(assetName, { name, asset: undefined!, lastModified: 0 })
      }
    },
    async generateBundle(options, bundle) {
      const preset = await lookupPresetIcons(ctx)
      if (!preset)
        return

      const spritesInfo = Object.entries(bundle).reduce<SpritesInfo>((acc, [name, asset]) => {
        if (name) {
          if (name.endsWith('.svg')) {
            if (asset.name && sprites.has(asset.name))
              acc.svgFiles.push([asset.name, asset.fileName, `url(${asset.name}`])
          }
          else if (name.endsWith('.css') && asset.type === 'asset' && 'source' in asset && typeof asset.source === 'string') {
            acc.cssFiles.push(asset)
          }
        }

        return acc
      }, { cssFiles: [], svgFiles: [] })

      if (!spritesInfo.cssFiles.length || !spritesInfo.svgFiles.length)
        return

      for (const asset of spritesInfo.cssFiles) {
        for (const [, fileName, find] of spritesInfo.svgFiles) {
          const idx = fileName.lastIndexOf('/')
          asset.source = (asset.source as string)
            .replaceAll(find, `url(${idx > -1 ? fileName.slice(idx + 1) : fileName}`)
        }
      }
    },
  }]
}

async function lookupPresetIcons(ctx: UnocssPluginContext) {
  await ctx.ready
  const preset: PresetIcons | undefined = ctx.uno.config?.presets?.find(p => 'options' in p && p.options && 'sprites' in p.options && typeof p.options.sprites !== 'undefined') as any
  return preset
}
