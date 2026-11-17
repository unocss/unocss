import type { Rollup } from 'vite'
import { Buffer } from 'node:buffer'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mergeConfigs } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import UnoCSS from '@unocss/vite'
import { build } from 'vite'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('vite filesystem content', () => {
  let root: string

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'unocss-content-'))
    await writeFile(join(root, 'entry.js'), 'import "virtual:uno.css"')
    await writeFile(join(root, 'slides.md'), '<div class="flex justify-between text-red-500 p-8"></div>')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it('extracts filesystem content after merging configs without pipeline filters', async () => {
    const result = await build({
      root,
      configFile: false,
      publicDir: false,
      logLevel: 'silent',
      plugins: [
        UnoCSS(mergeConfigs([
          { configFile: false, presets: [presetWind3()] },
          { content: { filesystem: ['slides.md'] } },
        ])),
      ],
      build: {
        write: false,
        minify: false,
        cssMinify: false,
        rollupOptions: {
          input: join(root, 'entry.js'),
        },
      },
    }) as Rollup.RollupOutput

    const css = result.output
      .filter((asset): asset is Rollup.OutputAsset => asset.type === 'asset' && asset.fileName.endsWith('.css'))
      .map(asset => Buffer.from(asset.source).toString())
      .join('\n')

    expect(css).toContain('.flex')
    expect(css).toContain('display:flex')
    expect(css).toContain('.justify-between')
    expect(css).toContain('justify-content:space-between')
    expect(css).toContain('.text-red-500')
    expect(css).toContain('.p-8')
  })

  it('ignores node_modules unless a filesystem glob explicitly includes it', async () => {
    await mkdir(join(root, 'node_modules/@foo/lib/src'), { recursive: true })
    await mkdir(join(root, 'node_modules/@bar/lib/src'), { recursive: true })
    await writeFile(
      join(root, 'node_modules/@foo/lib/src/Card.vue'),
      '<template><div class="bg-green-500">card</div></template>',
    )
    await writeFile(
      join(root, 'node_modules/@bar/lib/src/Button.vue'),
      '<template><button class="bg-blue-500">button</button></template>',
    )

    const cwd = vi.spyOn(process, 'cwd').mockReturnValue(root)

    async function buildCss(filesystem: string[]) {
      const result = await build({
        root,
        configFile: false,
        publicDir: false,
        logLevel: 'silent',
        plugins: [
          UnoCSS({
            configFile: false,
            presets: [presetWind3()],
            content: { filesystem },
          }),
        ],
        build: {
          write: false,
          minify: false,
          cssMinify: false,
          rollupOptions: {
            input: join(root, 'entry.js'),
          },
        },
      }) as Rollup.RollupOutput

      return result.output
        .filter((asset): asset is Rollup.OutputAsset => asset.type === 'asset' && asset.fileName.endsWith('.css'))
        .map(asset => Buffer.from(asset.source).toString())
        .join('\n')
    }

    try {
      const defaultCss = await buildCss(['**/*.vue'])
      expect(defaultCss).not.toContain('.bg-green-500')
      expect(defaultCss).not.toContain('.bg-blue-500')

      const explicitCss = await buildCss(['**/*.vue', 'node_modules/@foo/lib/**/*.vue'])
      expect(explicitCss).toContain('.bg-green-500')
      expect(explicitCss).not.toContain('.bg-blue-500')
    }
    finally {
      cwd.mockRestore()
    }
  })
})
