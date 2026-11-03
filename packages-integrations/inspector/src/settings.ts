import type { UnocssPluginContext } from '@unocss/core'
import type { SerializedUnoCSSSettings } from '../types'

/** Preserve regexes and functions as readable strings without circular data. */
export function serializeSettingsValue(value: unknown): string {
  if (typeof value === 'string')
    return value
  const ancestors: object[] = []
  return JSON.stringify(value, function (_key, item) {
    if (typeof item === 'function' || item instanceof RegExp)
      return String(item)
    if (item && typeof item === 'object') {
      while (ancestors.length && ancestors.at(-1) !== this)
        ancestors.pop()
      if (ancestors.includes(item))
        return '[Circular]'
      ancestors.push(item)
    }
    return item
  }) ?? String(value)
}

export async function getInspectorSettings(ctx: UnocssPluginContext): Promise<SerializedUnoCSSSettings> {
  const { sources } = await ctx.ready
  const config = ctx.uno.config
  return {
    version: ctx.uno.version,
    context: {
      root: ctx.root,
      configFile: sources[0],
      sources,
    },
    config: {
      envMode: config.envMode,
      presets: config.presets.map(preset => ({ name: preset.name })),
      rulesStatic: Object.keys(config.rulesStaticMap),
      rulesDynamic: config.rulesDynamic.map(rule => String(rule[0])),
      shortcuts: config.shortcuts.map(([matcher, body]) => ({
        matcher: String(matcher),
        body: serializeSettingsValue(body),
      })),
      variants: config.variants.map(variant => ({ name: variant.name ?? '(anonymous)' })),
      safelist: config.safelist.map(serializeSettingsValue),
      blocklist: config.blocklist.map(String),
      layers: config.layers,
      transformers: (config.transformers ?? []).map(transformer => ({ name: transformer.name })),
      theme: JSON.parse(serializeSettingsValue(config.theme)),
    },
  }
}
