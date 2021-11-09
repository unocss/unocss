import { Options } from 'tsup'

const config: Options = {
  splitting: false,
  format: ['iife'],
  entryPoints: [
    'src/*.ts',
  ],
  minify: true,
  outDir: __dirname,
}

export default config
