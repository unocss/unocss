import { Options } from 'tsup'

const config: Options = {
  splitting: true,
  format: ['cjs'],
  entryPoints: [
    'src/cli.ts',
    'src/index.ts',
  ],
  target: 'node14',
  clean: true,
  dts: true,
}

export default config
