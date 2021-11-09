import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['iife'],
  entryPoints: [
    'src/*.ts',
  ],
  minify: true,
}

export default config
