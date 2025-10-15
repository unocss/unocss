import { copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsup'

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
  splitting: true,
  loader: {
    '': 'file',
    '.ps1': 'file',
    '.cmd': 'file',
    '.CMD': 'file',
    '.md': 'file',
  },
  clean: true,
  onSuccess: async () => {
    // Copy jiti's babel.cjs to dist/babel.cjs as workaround for https://github.com/unocss/unocss/issues/4944
    // jiti has hardcoded: require('../dist/babel.cjs') which esbuild cannot resolve correctly
    // From dist/*.cjs -> ../dist/babel.cjs resolves to dist/babel.cjs
    const jitiPath = dirname(fileURLToPath(import.meta.resolve('jiti/package.json')))
    const babelSource = join(jitiPath, 'dist', 'babel.cjs')
    const babelDest = join(import.meta.dirname, 'dist', 'babel.cjs')

    await copyFile(babelSource, babelDest)
    console.log('✓ Copied babel.cjs to dist/')
  },
})
