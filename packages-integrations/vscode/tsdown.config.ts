import { defineConfig } from 'tsdown'

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
    'node_modules/@unocss/language-server/dist/*.cjs',
  ],
})
