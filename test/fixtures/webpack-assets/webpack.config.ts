import type { Configuration } from 'webpack'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import UnoCSS, { type WebpackPluginOptions } from '@unocss/webpack'

const dir = path.dirname(fileURLToPath(import.meta.url))

export function createWebpackConfig(options?: WebpackPluginOptions): Configuration {
  return {
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
        {
          test: /\.css$/,
          type: 'asset/source',
        },
      ],
    },
    plugins: [
      UnoCSS(options),
    ],
    optimization: {
      minimize: false,
    },
  }
}
