import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['esm', 'cjs'],
  entryPoints: [
    'node/index.ts',
  ],
  target: 'node14',
  dts: true,
}

export default config
