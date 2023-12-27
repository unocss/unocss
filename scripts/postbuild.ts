import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { verifyDist } from './dist-verify'

function patchCjs(cjsModulePath: string, name: string) {
  const cjsModule = readFileSync(cjsModulePath, 'utf-8')
  writeFileSync(
    cjsModulePath,
    cjsModule
      .replace(`'use strict';`, `'use strict';Object.defineProperty(exports, '__esModule', {value: true});`)
      .replace(`module.exports = ${name};`, `exports.default = ${name};`),
    { encoding: 'utf-8' },
  )
}

// @unocss/eslint-config
patchCjs(resolve('./packages/eslint-config/dist/flat.cjs'), 'flat')
patchCjs(resolve('./packages/eslint-config/dist/index.cjs'), 'index')

// @unocss/eslint-plugin
patchCjs(resolve('./packages/eslint-plugin/dist/index.cjs'), 'index')

// @unocss/postcss
patchCjs(resolve('./packages/postcss/dist/index.cjs'), 'unocss')

// unocss
patchCjs(resolve('./packages/unocss/dist/postcss.cjs'), 'postcss__default')

await verifyDist()
