import path from 'node:path'
import { fileURLToPath } from 'node:url'
import UnoCSS from '@unocss/webpack'

const dir = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('webpack').Configuration} */
export default {
  context: dir,
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.join(dir, 'dist'),
    filename: 'main.js',
    assetModuleFilename: 'assets/[name][ext]',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.png$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    UnoCSS(),
  ],
  optimization: {
    minimize: false,
  },
}
