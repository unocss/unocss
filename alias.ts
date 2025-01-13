import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function r(p: string) {
  return resolve(fileURLToPath(new URL('.', import.meta.url)), p)
}

// @keep-sorted
export const aliasEngine: Record<string, string> = {
  '@unocss/autocomplete': r('./packages-engine/autocomplete/src/'),
  '@unocss/cli': r('./packages-engine/cli/src/'),
  '@unocss/config': r('./packages-engine/config/src/'),
  '@unocss/core': r('./packages-engine/core/src/'),
  '@unocss/extractor-arbitrary-variants': r('./packages-engine/extractor-arbitrary-variants/src/'),
  '@unocss/inspector': r('./packages-engine/inspector/src/'),
  '@unocss/rule-utils': r('./packages-engine/rule-utils/src/'),
  '@unocss/scope': r('./packages-engine/scope/src/'),
  '@unocss/transformer-compile-class': r('./packages-engine/transformer-compile-class/src/'),
  '@unocss/transformer-directives': r('./packages-engine/transformer-directives/src/'),
  '@unocss/transformer-variant-group': r('./packages-engine/transformer-variant-group/src/'),
}

// @keep-sorted
export const aliasIntegrations: Record<string, string> = {
  '@unocss/astro': r('./packages-integrations/astro/src/'),
  '@unocss/eslint-config': r('./packages-integrations/eslint-config/src/'),
  '@unocss/eslint-plugin': r('./packages-integrations/eslint-plugin/src/'),
  '@unocss/extractor-mdc': r('./packages-integrations/extractor-mdc/src/'),
  '@unocss/extractor-pug': r('./packages-integrations/extractor-pug/src/'),
  '@unocss/extractor-svelte': r('./packages-integrations/extractor-svelte/src/'),
  '@unocss/nuxt': r('./packages-integrations/nuxt/src/'),
  '@unocss/postcss': r('./packages-integrations/postcss/src/'),
  '@unocss/postcss/esm': r('./packages-integrations/postcss/src/esm.ts'),
  '@unocss/svelte-scoped': r('./packages-integrations/svelte-scoped/src/'),
  '@unocss/vite': r('./packages-integrations/vite/src/'),
  '@unocss/vscode': r('./packages-integrations/vscode/src/'),
  '@unocss/webpack': r('./packages-integrations/webpack/src/'),
}

// @keep-sorted
export const aliasVirtual: Record<string, string> = {
  '#docs': r('./packages-virtual/shared-docs/src/'),
  '#docs/packages': r('./packages-virtual/shared-docs/src/packages.ts'),
  '#docs/unocss-bundle': r('./packages-virtual/shared-docs/src/unocss-bundle.ts'),
  '#integration/constants': r('./packages-virtual/shared-integration/src/constants.ts'),
  '#integration/content': r('./packages-virtual/shared-integration/src/content.ts'),
  '#integration/context': r('./packages-virtual/shared-integration/src/context.ts'),
  '#integration/defaults': r('./packages-virtual/shared-integration/src/defaults.ts'),
  '#integration/hash': r('./packages-virtual/shared-integration/src/hash.ts'),
  '#integration/layers': r('./packages-virtual/shared-integration/src/layers.ts'),
  '#integration/match-positions': r('./packages-virtual/shared-integration/src/match-positions.ts'),
  '#integration/sort-rules': r('./packages-virtual/shared-integration/src/sort-rules.ts'),
  '#integration/transformers': r('./packages-virtual/shared-integration/src/transformers.ts'),
  '#integration/utils': r('./packages-virtual/shared-integration/src/utils.ts'),
}

// @keep-sorted
export const aliasPresets: Record<string, string> = {
  '@unocss/preset-attributify': r('./packages-presets/preset-attributify/src/'),
  '@unocss/preset-icons': r('./packages-presets/preset-icons/src/'),
  '@unocss/preset-mini': r('./packages-presets/preset-mini/src/'),
  '@unocss/preset-rem-to-px': r('./packages-presets/preset-rem-to-px/src/'),
  '@unocss/preset-tagify': r('./packages-presets/preset-tagify/src/'),
  '@unocss/preset-typography': r('./packages-presets/preset-typography/src/'),
  '@unocss/preset-uno': r('./packages-presets/preset-uno/src/'),
  '@unocss/preset-web-fonts': r('./packages-presets/preset-web-fonts/src/'),
  '@unocss/preset-wind': r('./packages-presets/preset-wind/src/'),
  '@unocss/transformer-attributify-jsx-babel': r('./packages-presets/transformer-attributify-jsx-babel/src/'),
  '@unocss/transformer-attributify-jsx': r('./packages-presets/transformer-attributify-jsx/src/'),
  'unocss': r('./packages-presets/unocss/src/'),
  'unocss/vite': r('./packages-presets/unocss/src/vite.ts'),
}

export const alias: Record<string, string> = {
  ...aliasEngine,
  ...aliasIntegrations,
  ...aliasVirtual,
  ...aliasPresets,
}
