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

function patchDCts(ctsModulePath: string, name: string) {
  let content = readFileSync(ctsModulePath, 'utf-8').replace(`, ${name} as default `, ' ')
  content += `\nexport = ${name};`
  writeFileSync(
    ctsModulePath,
    content,
    { encoding: 'utf-8' },
  )
}

function patchTsupCjs(cjsModuleName: string, name: string) {
  let file = resolve(`${cjsModuleName}.cjs`)
  let content = readFileSync(file, 'utf-8')
  writeFileSync(
    file,
    content.replace(`module.exports = __`, `exports.default = __`),
    { encoding: 'utf-8' },
  )
  file = resolve(`${cjsModuleName}.d.cts`)
  content = readFileSync(file, 'utf-8').replace(`, ${name} as default `, ' ')
  content += `\nexport = ${name};`
  writeFileSync(
    file,
    content,
    { encoding: 'utf-8' },
  )
}

// @unocss/astro
patchCjs(resolve('./packages/astro/dist/index.cjs'), 'UnoCSSAstroIntegration')

// @unocss/eslint-config
patchCjs(resolve('./packages/eslint-config/dist/flat.cjs'), 'flat')
patchCjs(resolve('./packages/eslint-config/dist/index.cjs'), 'index')

// @unocss/eslint-plugin
patchCjs(resolve('./packages/eslint-plugin/dist/index.cjs'), 'index')

// @unocss/extractor-mdc
patchCjs(resolve('./packages/extractor-mdc/dist/index.cjs'), 'extractorMdc')

// @unocss/extractor-pug
patchCjs(resolve('./packages/extractor-pug/dist/index.cjs'), 'extractorPug')

// @unocss/extractor-svelte
patchCjs(resolve('./packages/extractor-svelte/dist/index.cjs'), 'extractorSvelte')

// @unocss/inspector
patchCjs(resolve('./packages/inspector/dist/index.cjs'), 'UnocssInspector')

// @unocss/nuxt
patchCjs(resolve('./packages/nuxt/dist/index.cjs'), 'index')
patchDCts(resolve('./packages/nuxt/dist/index.d.cts'), '_default')

// @unocss/postcss
patchCjs(resolve('./packages/postcss/dist/index.cjs'), 'unocss')

// @unocss/runtime
patchTsupCjs('./packages/runtime/dist/index', 'init')

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
