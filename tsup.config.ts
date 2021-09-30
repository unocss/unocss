import { Options } from 'tsup'

const config: Options = {
  splitting: true,
  format: ['esm', 'cjs'],
  entryPoints: ['src/*.ts'],
  clean: true,
}

export default config
