import { Options } from 'tsup'

const config: Options = {
  splitting: true,
  format: ['esm', 'cjs'],
  entryPoints: [
    'src/*.ts',
  ],
  clean: true,
  dts: true,
}

export default config
