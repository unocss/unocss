import { join, resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'
import webpack from 'webpack'
import config from './fixtures/webpack-png/webpack.config.mjs'

describe('webpack png', () => {
  it('preserves imported png bytes with @unocss/webpack enabled', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/webpack-png')
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
  })
})
