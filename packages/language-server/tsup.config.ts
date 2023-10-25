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
  shims: false,
})
