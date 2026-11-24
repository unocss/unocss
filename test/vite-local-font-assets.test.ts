import { Buffer } from 'node:buffer'
import { rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import presetWebFonts from '@unocss/preset-web-fonts'
import { createLocalFontProcessor, downloadedFontsRegistryKey } from '@unocss/preset-web-fonts/local'
import presetWind3 from '@unocss/preset-wind3'
import UnoCSS from '@unocss/vite'
import { GlobalModeBuildPlugin } from '@unocss/vite/modes/global/build'
import { glob } from 'tinyglobby'
import { build } from 'vite'
import { describe, expect, it, vi } from 'vitest'

function createMockContext() {
  return {
    ready: Promise.resolve(),
    extract: async () => {},
    tokens: new Set<string>(),
    filter: () => false,
    getConfig: async () => ({}),
    tasks: [] as Promise<void>[],
    flushTasks: async () => {},
    uno: {} as any,
    getVMPRegexes: async () => ({}),
  } as any
}

function getDownloadedFonts() {
  const registry: Map<string, Buffer> = (globalThis as any)[downloadedFontsRegistryKey] ??= new Map()
  return registry
}

describe('local web fonts emitted to build output', () => {
  it('emits registered fonts as bundle assets in generateBundle', () => {
    const registry = getDownloadedFonts()
    registry.clear()
    registry.set('assets/fonts/fake-1234abcd.woff2', Buffer.from([1, 2, 3]))

    const plugins = GlobalModeBuildPlugin(createMockContext())
    const generatePlugin = plugins.find(p => p.name === 'unocss:global:build:generate')!
    const emitFile = vi.fn()
    ;(generatePlugin.generateBundle as any).call({ emitFile })

    expect(emitFile).toHaveBeenCalledTimes(1)
    expect(emitFile).toHaveBeenCalledWith({
      type: 'asset',
      fileName: 'assets/fonts/fake-1234abcd.woff2',
      source: expect.any(Buffer),
    })
  })

  it('clears the download registry on buildStart', async () => {
    const registry = getDownloadedFonts()
    registry.clear()
    registry.set('assets/fonts/stale.woff2', Buffer.from([4, 5, 6]))

    const plugins = GlobalModeBuildPlugin(createMockContext())
    const scanPlugin = plugins.find(p => p.name === 'unocss:global:build:scan')!
    await (scanPlugin.buildStart as any).call({})

    expect(registry.size).toBe(0)
  })

  it('fonts downloaded mid-build still reach the output directory', async () => {
    const root = resolve(import.meta.dirname, 'fixtures/vite-web-fonts')
    await rm(join(root, 'dist'), { recursive: true, force: true })
    await rm(join(root, 'public'), { recursive: true, force: true })
    await rm(join(root, '.cache'), { recursive: true, force: true })

    const fontBytes = new Uint8Array([0x77, 0x4F, 0x46, 0x32])

    await build({
      root,
      logLevel: 'warn',
      plugins: [
        UnoCSS({
          presets: [
            presetWind3(),
            presetWebFonts({
              provider: 'google',
              fonts: {
                mono: 'Fira Mono',
              },
              processors: [
                createLocalFontProcessor({
                  cacheDir: join(root, '.cache/fonts'),
                  fontAssetsDir: join(root, 'public/assets/fonts'),
                  fontServeBaseUrl: '/assets/fonts',
                  fetch: async () => new Response(fontBytes),
                }),
              ],
            }),
          ],
        }),
      ],
    })

    const emitted = await glob('dist/assets/fonts/*.woff2', { cwd: root })
    expect(emitted.length).toBeGreaterThan(0)
  })
})
