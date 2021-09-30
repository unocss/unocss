import { Options } from 'tsup'

const config: Options = {
  splitting: true,
  format: ['esm', 'cjs'],
  entryPoints: [
    'src/index.ts',
    'src/vite.ts',
  ],
  clean: true,
  dts: true,
}

export default config
