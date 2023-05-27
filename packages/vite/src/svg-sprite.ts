import type { Awaitable, Preset, UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { warnOnce } from '@unocss/core'

const ENTRY_ALIAS = /^unocss-(.*)-sprite\.svg$/

type PresetIcons = Preset & {
  options: {
    warn?: boolean
    sprites?: {
      collections: string | string[]
      loader: (name: string) => Awaitable<Record<string, string> | undefined>
    }
  }
}

interface SpriteEntry {
  content: string
  rawViewBox: string
  x: number
  y: number
  width: number
  height: number
  entry: string
}

interface Sprites {
  content: string
  previous?: Pick<SpriteEntry, 'y'>
}

const sprites = new Map<string, Promise<string>>()

export function SVGSpritePlugin(ctx: UnocssPluginContext): Plugin {
  return {
    name: 'unocss:css-svg-sprite',
    enforce: 'pre',
    configureServer(server) {
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

        const sprite = await prepareSVGSprite(ctx, match[1])

        res.setHeader('Content-Type', 'image/svg+xml')
        if (sprite) {
          res.statusCode = 200
          res.write(sprite, 'utf-8')
        }
        else {
          res.statusCode = 404
        }
        res.end()
      })
    },
    async generateBundle() {

    },
  }
}

// TODO: move this to utils package in @iconify/iconify
function parseSVGData(data: string) {
  const match = data.match(/<svg[^>]+viewBox="([^"]+)"[^>]*>([\s\S]+)<\/svg>/)
  if (!match)
    return

  const [, viewBox, path] = match
  const [x, y, width, height] = viewBox.split(' ').map(Number)
  return <SpriteEntry>{ rawViewBox: match[1], content: path, x, y, width, height }
}

// TODO: move this to utils package in @iconify/iconify
function createCSSSVGSprite(icons: Record<string, string>) {
  return `<svg xmlns="http://www.w3.org/2000/svg">${
      Object.entries(icons).reduce((acc, [name, icon]) => {
        const data = parseSVGData(icon)
        if (data) {
          const newY = acc.previous ? (acc.previous.y + 1) : data.y
          acc.content += `
  <symbol id="shapes-${name}" viewBox="${data.rawViewBox}">${data.content}</symbol>
  <view id="shapes-${name}-view" viewBox="${data.x} ${newY} ${data.width} ${data.height}"/>
  <use href="#shapes-${name}" x="${data.x}" y="${newY}" id="${name}"/>`

          acc.previous = {
            y: data.height + (acc.previous ? acc.previous.y : 0),
          }
        }

        return acc
      }, <Sprites>{ content: '' }).content}
</svg>`
}

function createSVGSpritePromise(icons: Record<string, string>) {
  return new Promise<string>((resolve, reject) => {
    try {
      resolve(createCSSSVGSprite(icons))
    }
    catch (e) {
      reject(e)
    }
  })
}

async function loadSVGSpriteIcons(preset: PresetIcons, sprite: string) {
  const sprites = preset.options!.sprites!
  if ((typeof sprites.collections === 'string' && sprites.collections !== sprite) || !sprites.collections.includes(sprite)) {
    if (preset.options.warn)
      warnOnce(`missing collection in sprites.collections "${sprite}", svg sprite will not generated in build`)

    return ''
  }

  const icons = await sprites.loader(sprite)
  return icons ? await createSVGSpritePromise(icons) : ''
}

async function prepareSVGSprite(ctx: UnocssPluginContext, sprite: string) {
  await ctx.ready
  const preset: PresetIcons = ctx.uno.config?.presets?.find(p => 'options' in p && p.options && 'sprites' in p.options && typeof p.options.sprites !== 'undefined') as any
  if (!preset || typeof preset.options?.sprites === 'undefined')
    return

  const spriteEntry = sprites.get(sprite) ?? sprites.set(sprite, loadSVGSpriteIcons(preset, sprite)).get(sprite)!

  const data = await spriteEntry
  return data.length ? data : undefined
}
