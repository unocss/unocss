import type { Variant } from 'unocss'
import process from 'node:process'
import { defineConfig, presetWind3, transformerBuildThemes, variantBuildThemes } from 'unocss'

export const facets = {
  client: ['acme', 'globex', 'initech'],
  edition: ['standard', 'premium'],
}

const options = {
  facets,
  active: {
    client: process.env.CLIENT ?? 'acme',
    edition: process.env.EDITION ?? 'standard',
  },
}

/**
 * `THEMES=runtime` builds the same page with runtime themes instead, for
 * comparison: every facet value becomes a `[data-<facet>="<value>"]` parent
 * selector, so all themes ship and are switched with attributes on `<html>`.
 */
const runtime = process.env.THEMES === 'runtime'

function runtimeThemeVariants(): Variant[] {
  return Object.entries(facets).flatMap(([facet, values]) => values.map((value): Variant => ({
    name: `runtime-theme:${value}`,
    match: matcher => matcher.startsWith(`${value}:`)
      ? { matcher: matcher.slice(value.length + 1), selector: s => `[data-${facet}="${value}"] ${s}` }
      : undefined,
  })))
}

export default defineConfig({
  presets: [
    presetWind3(),
  ],
  variants: runtime
    ? runtimeThemeVariants()
    // Lets editor tooling recognize facet values. Builds never see them.
    : variantBuildThemes(options),
  transformers: runtime
    ? []
    : [transformerBuildThemes(options)],
})
