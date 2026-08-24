import { join, resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'
import webpack from 'webpack'
import { createWebpackConfig } from './fixtures/webpack-png/webpack.config'

const root = resolve(import.meta.dirname, 'fixtures/webpack-png')

async function runWebpack(config: webpack.Configuration) {
  await fs.emptyDir(join(root, 'dist'))

  await new Promise<void>((resolvePromise, reject) => {
    webpack(config, (err, stats) => {
      if (err)
        return reject(err)
      if (stats?.hasErrors())
        return reject(stats.toJson()?.errors)
      resolvePromise()
    })
  })

  const src = await fs.readFile(join(root, 'src/logo.png'))
  const out = await fs.readFile(join(root, 'dist/assets/logo.png'))
  expect(out.equals(src)).toBe(true)
  expect(out[0]).toBe(0x89)
  expect(out[1]).toBe(0x50)
}

describe('webpack png', () => {
  it('preserves imported png bytes with @unocss/webpack enabled', async () => {
    await runWebpack(createWebpackConfig())
  })

  it('preserves imported png bytes with custom virtualModulePrefix', async () => {
    await runWebpack(createWebpackConfig({ virtualModulePrefix: 'custom_uno' }))
  })
})
