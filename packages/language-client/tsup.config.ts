import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/server.ts',
  ],
  external: [
    'vscode',
  ],
  format: [
    'cjs',
  ],
  shims: false,
})
