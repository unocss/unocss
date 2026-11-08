import type { Variant } from 'unocss'
import process from 'node:process'
import { defineConfig, presetWind3, transformerBuildThemes, variantBuildThemes } from 'unocss'

export const themes = {
  client: ['acme', 'globex', 'initech'],
  scheme: ['day', 'night'],
}

const options = {
  themes,
  active: {
    client: process.env.CLIENT ?? 'acme',
    scheme: process.env.SCHEME ?? 'day',
  },
}

/**
 * `THEMES=runtime` builds the same page with runtime themes instead, for
 * comparison: every theme prefix becomes a `[data-<group>="<theme>"]` parent
 * selector, so all themes ship and are switched with attributes on `<html>`.
 */
const runtime = process.env.THEMES === 'runtime'

function runtimeThemeVariants(): Variant[] {
  return Object.entries(themes).flatMap(([group, names]) => names.map((name): Variant => ({
    name: `runtime-theme:${name}`,
    match: matcher => matcher.startsWith(`${name}:`)
      ? { matcher: matcher.slice(name.length + 1), selector: s => `[data-${group}="${name}"] ${s}` }
      : undefined,
  })))
}

export default defineConfig({
  presets: [
    presetWind3(),
  ],
  variants: runtime
    ? runtimeThemeVariants()
    // Lets editor tooling recognize theme prefixes. Builds never see them.
    : variantBuildThemes(options),
  transformers: runtime
    ? []
    : [transformerBuildThemes(options)],
})
