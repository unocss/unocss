import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['cjs'],
  entryPoints: [
    'src/index.ts',
  ],
  clean: true,
}

export default config
