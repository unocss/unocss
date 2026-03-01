import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { defineConfig } from 'tsdown'
import { aliasVirtual } from '../../alias'

// Copy jiti's babel.cjs to dist/babel.cjs as workaround for https://github.com/unocss/unocss/issues/4944
const _require = createRequire(import.meta.url) // Compatible with CI with lower node version
const jitiPath = dirname(_require.resolve('jiti/package.json'))
const babelSource = join(jitiPath, 'dist', 'babel.cjs')

export default defineConfig([
  {
    entry: ['src/server.ts'],
    format: ['cjs'],
    clean: true,
    shims: true,
    alias: aliasVirtual,
    noExternal: [
      /^@unocss\//,
      /^unconfig/,
      /^prettier/,
      /^vscode-languageserver/,
    ],
    copy: [
      babelSource,
    ],
  },
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    alias: aliasVirtual,
    exports: true,
    failOnWarn: true,
    publint: 'ci-only',
  },
])
