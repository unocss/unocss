import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function patchCjs(cjsModulePath: string, name: string) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule.replace(`module.exports = ${name};`, `exports.default = ${name};`),
    { encoding: 'utf-8' },
  )
}

// @unocss/astro
patchCjs(resolve('./packages/astro/dist/index.cjs'), 'UnoCSSAstroIntegration')

// @unocss/extractor-mdc
patchCjs(resolve('./packages/extractor-mdc/dist/index.cjs'), 'extractorMdc')

// @unocss/extractor-pug
patchCjs(resolve('./packages/extractor-pug/dist/index.cjs'), 'extractorPug')

// @unocss/extractor-svelte
patchCjs(resolve('./packages/extractor-svelte/dist/index.cjs'), 'extractorSvelte')

// @unocss/postcss
patchCjs(resolve('./packages/postcss/dist/index.cjs'), 'unocss')

// @unocss/svelte-scoped
patchCjs(resolve('./packages/svelte-scoped/dist/preprocess.cjs'), 'UnocssSveltePreprocess')
patchCjs(resolve('./packages/svelte-scoped/dist/vite.cjs'), 'UnocssSvelteScopedVite')

// @unocss/transformer-attributify-jsx
patchCjs(resolve('./packages/transformer-attributify-jsx/dist/index.cjs'), 'transformerAttributifyJsx')

// @unocss/transformer-attributify-jsx-babel
patchCjs(resolve('./packages/transformer-attributify-jsx-babel/dist/index.cjs'), 'transformerAttributifyJsx')

// @unocss/transformer-compile-class
patchCjs(resolve('./packages/transformer-compile-class/dist/index.cjs'), 'transformerCompileClass')

// @unocss/transformer-directives
patchCjs(resolve('./packages/transformer-directives/dist/index.cjs'), 'transformerDirectives')

// @unocss/transformer-variant-group
patchCjs(resolve('./packages/transformer-variant-group/dist/index.cjs'), 'transformerVariantGroup')

// unocss
patchCjs(resolve('./packages/unocss/dist/astro.cjs'), 'UnocssAstroIntegration')
patchCjs(resolve('./packages/unocss/dist/postcss.cjs'), 'postcss__default')
