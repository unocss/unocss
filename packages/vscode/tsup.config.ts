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
  splitting: true,
  loader: {
    '': 'file',
    '.ps1': 'file',
    '.cmd': 'file',
    '.CMD': 'file',
    '.md': 'file',
  },
})
