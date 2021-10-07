import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['cjs'],
  entryPoints: [
    'src/index.ts',
  ],
  clean: true,
  dts: true,
}

export default config
