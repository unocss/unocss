import { yellow } from 'kolorist'
import type { IconifyLoaderOptions } from '@iconify/utils/lib/loader/types'
import type {
  AsyncSpriteIcons,
  AsyncSpriteIconsFactory,
  SpriteCollection,
  SpriteIcon,
} from './types'

const warned = new Set<string>()

export interface SpritesContext_v1 {
  content: string
  minY?: number
  options?: IconifyLoaderOptions
}

export interface SpriteEntry_v1 {
  content: string
  rawViewBox: string
  x: number
  y: number
  width: number
  height: number
  entry: string
}

export function createAsyncSpriteIconsFactory(
  collections: SpriteCollection | SpriteCollection[],
  mapIconName: (icon: string, collection?: string) => string = icon => icon,
) {
  const collectionsArray = Array.isArray(collections)
    ? collections
    : [collections]

  return <AsyncSpriteIconsFactory> async function* () {
    for (const collection of collectionsArray) {
      if (Array.isArray(collection)) {
        for (const icon of collection) {
          yield {
            name: mapIconName(icon.name, icon.collection),
            svg: icon.svg,
          }
        }
      }
      else if ('svg' in collection) {
        yield {
          name: mapIconName(collection.name, collection.collection),
          svg: collection.svg,
        }
      }
      else if (typeof collection === 'function') {
        const iterator = collection()
        for await (const icon of iterator) {
          yield {
            name: mapIconName(icon.name, icon.collection),
            svg: icon.svg,
          }
        }
      }
      else {
        for await (const icon of collection[Symbol.asyncIterator]()) {
          yield {
            name: mapIconName(icon.name, icon.collection),
            svg: icon.svg,
          }
        }
      }
    }
  }
}

export async function createUint8ArraySprite(
  spriteName: string,
  icons: AsyncSpriteIcons | AsyncSpriteIconsFactory,
  options: boolean | {
    warn?: boolean
    callback?: (chunk: DataView) => void | Promise<void>
  } = false,
) {
  const textEncoder = new TextEncoder()
  const context: SpritesContext_v1 = { content: '' }
  const warn = typeof options === 'boolean' ? options : options?.warn === true
  const callback = typeof options === 'object' ? options?.callback : undefined
  const iterator = typeof icons === 'function' ? icons() : icons[Symbol.asyncIterator]()
  const chunks = [
    textEncoder.encode('<svg xmlns="http://www.w3.org/2000/svg">').buffer,
  ]
  for await (const value of iterator) {
    const data = parseSVGData(spriteName, value.name, value.svg, warn)
    if (data) {
      chunks.push(
        textEncoder.encode(generateSpriteEntry(context, data, value))
          .buffer,
      )
    }
  }
  chunks.push(textEncoder.encode('</svg>').buffer)
  const totalByteLength = chunks.reduce(
    (acc, chunk) => acc + chunk.byteLength,
    0,
  )
  const concatenatedBuffer = new ArrayBuffer(totalByteLength)
  const dataView = new DataView(concatenatedBuffer)
  let offset = 0

  // Concatenate the chunks into a single ArrayBuffer
  for (const chunk of chunks) {
    const chunkDataView = new DataView(chunk)
    for (let i = 0; i < chunk.byteLength; i++)
      dataView.setUint8(offset + i, chunkDataView.getUint8(i))

    offset += chunk.byteLength
  }

  await callback?.(dataView)

  // Convert the concatenated ArrayBuffer to a Uint8Array
  return new Uint8Array(concatenatedBuffer)
}

function generateSpriteEntry(
  context: SpritesContext_v1,
  data: SpriteEntry_v1,
  icon: SpriteIcon,
) {
  const y = context.minY ?? 0
  const entry = `
  <symbol id="shapes-${icon.name}" viewBox="${data.rawViewBox}">${data.content}</symbol>
  <view id="shapes-${icon.name}-view" viewBox="${data.x} ${y} ${data.width} ${data.height}"/>
  <use href="#shapes-${icon.name}" x="${data.x}" y="${y}" id="${icon.name}"/>`
  context.minY = y + data.height + 1
  return entry
}

function parseSVGData(
  spriteName: string,
  name: string,
  data: string,
  warn: boolean,
) {
  const match = data.match(
    /<svg[^>]+viewBox="([^"]+)"[^>]*>([\s\S]+)<\/svg>/,
  )
  if (!match) {
    const key = `${spriteName}:${name}`
    if (warn && !warned.has(key)) {
      warned.add(key)
      console.warn(
        yellow(`[@iconify-svg-css-sprite] missing or wrong viewBox in "${name}" SVG icon: excluded from "${spriteName}" sprite!`),
      )
    }
    return
  }

  if (data.includes('<style') || data.includes('<animation')) {
    const key = `${spriteName}:${name}`
    if (warn && !warned.has(key)) {
      warned.add(key)
      console.warn(
        yellow(`[@iconify-svg-css-sprite] "${name}" SVG icon includes <style>/<animation>: should be excluded from "${spriteName}" sprite since it will affect all other icons!`),
      )
    }
  }

  const [, viewBox, path] = match
  const [x, y, width, height] = viewBox.split(' ').map(Number)

  return <SpriteEntry_v1>{
    rawViewBox: viewBox,
    content: path,
    x,
    y,
    width,
    height,
  }
}
