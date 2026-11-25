import type { GenerateResult, UnocssPluginContext } from '@unocss/core'
import type { Plugin } from 'vite'
import { LAYER_MARK_ALL } from '#integration/constants'
import { getHash } from '#integration/hash'
import { resolveLayer } from '#integration/layers'
import { buildGlobalModeDevPlugin } from '#integration/vite/global/dev'
import { MESSAGE_UNOCSS_ENTRY_NOT_FOUND } from './shared'

const HASH_LENGTH = 6

export function GlobalModeDevPlugin(ctx: UnocssPluginContext): Plugin[] {
  const { tokens, flushTasks } = ctx
  const entries = new Set<string>()

  const lastServedHashes = new Map<string, string>()
  let lastServedTime = Date.now()

  async function generateCSS(layer: string) {
    await flushTasks()
    let result: GenerateResult
    let tokensSize = tokens.size
    do {
      result = await ctx.uno.generate(tokens)
      // to capture new tokens created during generation
      if (tokensSize === tokens.size)
        break
      tokensSize = tokens.size
    } while (true)

    const css = layer === LAYER_MARK_ALL
      ? result.getLayers(undefined, await Promise.all(Array.from(entries)
          .map(i => resolveLayer(ctx, i))).then(layers => layers.filter((i): i is string => !!i)))
      : result.getLayer(layer)
    const hash = getHash(css || '', HASH_LENGTH)
    lastServedHashes.set(layer, hash)
    lastServedTime = Date.now()
    return { hash, css }
  }

  return buildGlobalModeDevPlugin(
    ctx,
    generateCSS,
    lastServedHashes,
    () => lastServedTime,
    entries,
    HASH_LENGTH,
    () => {
      // Keep the behavior and always track any imported entry.
      return true
    },
    MESSAGE_UNOCSS_ENTRY_NOT_FOUND,
  )
}
