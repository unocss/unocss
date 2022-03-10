import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  external: [
    'vscode',
    'jiti',
  ],
  format: [
    'cjs',
  ],
  shims: false,
})
