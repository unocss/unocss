import { readFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import webpack from 'webpack'
import { createWebpackConfig } from './fixtures/webpack-assets/webpack.config'

const root = resolve(import.meta.dirname, 'fixtures/webpack-assets')

async function runWebpack(options?: Parameters<typeof createWebpackConfig>[0]) {
  const cwd = process.cwd()
  process.chdir(root)

  try {
    await runWebpackConfig(createWebpackConfig(options))
  }
  finally {
    process.chdir(cwd)
  }
}

async function runWebpackConfig(config: webpack.Configuration) {
  await rm(join(root, 'dist'), { recursive: true, force: true })

  await new Promise<void>((resolvePromise, reject) => {
    webpack(config, (err, stats) => {
      if (err)
        return reject(err)
      if (stats?.hasErrors())
        return reject(stats.toJson()?.errors)
      resolvePromise()
    })
  })

  const src = await readFile(join(root, 'src/logo.png'))
  const out = await readFile(join(root, 'dist/assets/logo.png'))
  const bundle = await readFile(join(root, 'dist/main.js'), 'utf8')
  expect(out.equals(src)).toBe(true)
  expect(out[0]).toBe(0x89)
  expect(out[1]).toBe(0x50)
  expect(bundle).toContain('.text-red')
}

describe('webpack png', () => {
  it('preserves imported png bytes with @unocss/webpack enabled', async () => {
    await runWebpack()
  })

  it('preserves imported png bytes with custom virtualModulePrefix', async () => {
    await runWebpack({ virtualModulePrefix: 'custom_uno' })
  })
})
