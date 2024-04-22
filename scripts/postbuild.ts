import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { verifyDist } from './dist-verify'

function _patchCjs(cjsModulePath: string, name: string) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule
      .replace(`'use strict';`, `'use strict';Object.defineProperty(exports, '__esModule', {value: true});`)
      .replace(`module.exports = ${name};`, `exports.default = ${name};`),
    { encoding: 'utf-8' },
  )
}

function patchCjsDts(cjsModulePath: string, name: string, useName = false) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule
      .replace(`export { ${name} as default };`, `export = ${useName ? name : '_default'};`),
    { encoding: 'utf-8' },
  )
}

function patchPostcssCjsDts(cjsModulePath: string) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule
      .replace(`export { type UnoPostcssPluginOptions, unocss as default };`, `export = unocss;\nexport { type UnoPostcssPluginOptions };`),
    { encoding: 'utf-8' },
  )
}

function patchWebpackCjsDts(cjsModulePath: string) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule
      .replace(`export { type WebpackPluginOptions, WebpackPlugin as default, defineConfig };`, `export = WebpackPlugin;\nexport { type WebpackPluginOptions, defineConfig };`),
    { encoding: 'utf-8' },
  )
}

function patchPostcss2CjsDts(cjsModulePath: string) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule
      .replace(`export { default } from '@unocss/postcss';`, `export = postcss;`),
    { encoding: 'utf-8' },
  )
}

// @unocss/eslint-config
patchCjsDts(resolve('./packages/eslint-config/dist/flat.d.ts'), '_default')
patchCjsDts(resolve('./packages/eslint-config/dist/flat.d.cts'), '_default')
patchCjsDts(resolve('./packages/eslint-config/dist/index.d.ts'), '_default')
patchCjsDts(resolve('./packages/eslint-config/dist/index.d.cts'), '_default')
// patchCjs(resolve('./packages/eslint-config/dist/flat.cjs'), 'flat')
// patchCjs(resolve('./packages/eslint-config/dist/index.cjs'), 'index')

// @unocss/eslint-plugin
patchCjsDts(resolve('./packages/eslint-plugin/dist/index.d.ts'), '_default')
patchCjsDts(resolve('./packages/eslint-plugin/dist/index.d.cts'), '_default')
// patchCjs(resolve('./packages/eslint-plugin/dist/index.cjs'), 'index')

// @unocss/postcss
patchPostcssCjsDts(resolve('./packages/postcss/dist/index.d.ts'))
patchPostcssCjsDts(resolve('./packages/postcss/dist/index.d.cts'))
// patchCjs(resolve('./packages/postcss/dist/index.cjs'), 'unocss')

// @unocss/webpack
patchWebpackCjsDts(resolve('./packages/webpack/dist/index.d.ts'))
patchWebpackCjsDts(resolve('./packages/webpack/dist/index.d.cts'))

// unocss
patchPostcss2CjsDts(resolve('./packages/unocss/dist/postcss.d.ts'))
patchPostcss2CjsDts(resolve('./packages/unocss/dist/postcss.d.cts'))
patchCjsDts(resolve('./packages/unocss/dist/webpack.d.ts'), 'UnocssWebpackPlugin', true)
patchCjsDts(resolve('./packages/unocss/dist/webpack.d.cts'), 'UnocssWebpackPlugin', true)
// patchCjs(resolve('./packages/unocss/dist/postcss.cjs'), 'postcss__default')

await verifyDist()
