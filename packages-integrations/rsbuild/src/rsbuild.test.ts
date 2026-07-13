import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRsbuild } from '@rsbuild/core'
import presetUno from '@unocss/preset-uno'
import { glob } from 'tinyglobby'
import { afterEach, expect, it } from 'vitest'
// This integration test intentionally verifies the built package.
// eslint-disable-next-line antfu/no-import-dist
import { pluginUnoCSS } from '../dist/index.mjs'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { force: true, recursive: true })))
})

it('integrates with the Rsbuild CSS inline query pipeline', async () => {
  const root = await mkdtemp(join(tmpdir(), 'unocss-rsbuild-inline-'))
  temporaryDirectories.push(root)
  const sourceDirectory = join(root, 'src')
  const outputDirectory = join(root, 'dist')
  await mkdir(sourceDirectory, { recursive: true })
  await writeFile(
    join(sourceDirectory, 'index.jsx'),
    'import uno from "uno.css?inline"; export const css = uno; export const view = `<div class="text-red"></div>`;',
    'utf8',
  )

  const rsbuild = await createRsbuild({
    cwd: root,
    config: {
      mode: 'production',
      output: {
        distPath: { root: outputDirectory },
      },
      plugins: [
        pluginUnoCSS({
          configOrPath: { presets: [presetUno()] },
        }),
      ],
      source: {
        entry: { index: './src/index.jsx' },
      },
    },
  })
  await rsbuild.build()

  const files = await glob('**/*.js', { cwd: outputDirectory, absolute: true })
  const output = (await Promise.all(files.map(file => readFile(file, 'utf8')))).join('\n')
  expect(output).toContain('.text-red')
  expect(output).not.toContain('#--unocss')
})
