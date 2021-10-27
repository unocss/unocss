import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['esm', 'cjs'],
  entryPoints: [
    'src/index.ts',
  ],
  target: 'es2018',
  clean: true,
  dts: true,
}

export default config
