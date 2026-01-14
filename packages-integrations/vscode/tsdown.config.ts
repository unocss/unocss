import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { defineConfig } from 'tsdown'

// Copy jiti's babel.cjs to dist/babel.cjs as workaround for https://github.com/unocss/unocss/issues/4944
// jiti has hardcoded: require('../dist/babel.cjs') which esbuild cannot resolve correctly
// From dist/*.cjs -> ../dist/babel.cjs resolves to dist/babel.cjs
const _require = createRequire(import.meta.url) // Compatible with CI with lower node version
const jitiPath = dirname(_require.resolve('jiti/package.json'))
const babelSource = join(jitiPath, 'dist', 'babel.cjs')

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  external: [
    'vscode',
  ],
  format: [
    'cjs',
  ],
  shims: true,
  clean: true,
  copy: [
    babelSource,
  ],
})
