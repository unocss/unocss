import { Options } from 'tsup'

const config: Options = {
  splitting: true,
  format: ['esm', 'cjs'],
  entryPoints: [
    'src/*.ts',
  ],
  target: 'esnext',
  clean: true,
  dts: true,
}

export default config
