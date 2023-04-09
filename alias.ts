import { resolve } from 'node:path'

function r(p: string) {
  return resolve(__dirname, p)
}

export const alias: Record<string, string> = {
  '@unocss/astro': r('./packages/astro/src/'),
  '@unocss/autocomplete': r('./packages/autocomplete/src/'),
  '@unocss/cli': r('./packages/cli/src/'),
  '@unocss/config': r('./packages/config/src/'),
  '@unocss/core': r('./packages/core/src/'),
  '@unocss/extractor-pug': r('./packages/extractor-pug/src/'),
  '@unocss/extractor-svelte': r('./packages/extractor-svelte/src/'),
  '@unocss/inspector': r('./packages/inspector/node/'),
  '@unocss/nuxt': r('./packages/nuxt/src/'),
  '@unocss/preset-attributify': r('./packages/preset-attributify/src/'),
  '@unocss/preset-icons': r('./packages/preset-icons/src/'),
  '@unocss/preset-mini': r('./packages/preset-mini/src/'),
  '@unocss/preset-rem-to-px': r('./packages/preset-rem-to-px/src/'),
  '@unocss/preset-tagify': r('./packages/preset-tagify/src/'),
  '@unocss/preset-typography': r('./packages/preset-typography/src/'),
  '@unocss/preset-uno': r('./packages/preset-uno/src/'),
  '@unocss/preset-web-fonts': r('./packages/preset-web-fonts/src/'),
  '@unocss/preset-wind': r('./packages/preset-wind/src/'),
  '@unocss/extractor-arbitrary-variants': r('./packages/extractor-arbitrary-variants/src/'),
  '@unocss/runtime': r('./packages/runtime/src/'),
  '@unocss/scope': r('./packages/scope/'),
  '@unocss/shared-common': r('./packages/shared-common/src/'),
  '@unocss/shared-docs': r('./packages/shared-docs/src/'),
  '@unocss/shared-integration': r('./packages/shared-integration/src/'),
  '@unocss/transformer-attributify-jsx': r('./packages/transformer-attributify-jsx/src/'),
  '@unocss/transformer-attributify-jsx-babel': r('./packages/transformer-attributify-jsx-babel/src/'),
  '@unocss/transformer-compile-class': r('./packages/transformer-compile-class/src/'),
  '@unocss/transformer-directives': r('./packages/transformer-directives/src/'),
  '@unocss/transformer-variant-group': r('./packages/transformer-variant-group/src/'),
  'unocss': r('./packages/unocss/src/'),
  '@unocss/vite': r('./packages/vite/src/'),
  '@unocss/postcss': r('./packages/postcss/src/'),
  '@unocss/webpack': r('./packages/webpack/src/'),
}
