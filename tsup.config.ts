import { Options } from 'tsup'

const config: Options = {
  splitting: true,
  format: ['esm', 'cjs'],
  entryPoints: [
    'entries/*.ts',
  ],
  clean: true,
  dts: true,
}

export default config
