import type { UnocssPluginContext } from '@unocss/core'
import type { ViteDevServer } from 'vite'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the path module
const mockResolve = vi.fn()
vi.mock('node:path', () => ({
  resolve: mockResolve,
}))

// Import the plugin after mocking
const { ConfigHMRPlugin } = await import('../src/config-hmr')

describe('configHMRPlugin - uno.config.js HMR Fix', () => {
  const mockWatcher = {
    add: vi.fn(),
    on: vi.fn(),
  }

  const mockServer: ViteDevServer = {
    watcher: mockWatcher,
    ws: {
      send: vi.fn(),
    },
  } as any

  const createMockContext = (sources: string[]): UnocssPluginContext =>
    ({
      root: '/test/project',
      ready: Promise.resolve({
        sources,
        config: {},
        dependencies: [],
      }),
      updateRoot: vi.fn(),
      reloadConfig: vi.fn(),
      uno: {
        config: { envMode: 'dev' },
      },
    } as any)

  beforeEach(() => {
    vi.clearAllMocks()
    mockResolve.mockImplementation((path: string) => path)
  })

  it('should detect config changes when relative paths resolve to same file', async () => {
    const ctx = createMockContext(['/test/project/uno.config.js'])
    const plugin = ConfigHMRPlugin(ctx)

    if (plugin?.configureServer) {
      await (plugin.configureServer as any)(mockServer)
    }

    const changeHandler = mockWatcher.on.mock.calls.find(
      call => call[0] === 'change',
    )?.[1]

    // Mock resolve to normalize paths to same absolute path
    mockResolve
      .mockReturnValueOnce('/test/project/uno.config.js') // Changed file
      .mockReturnValueOnce('/test/project/uno.config.js') // Source comparison

    // Simulate file change with relative path (the bug scenario)
    await changeHandler!('./uno.config.js')

    expect(ctx.reloadConfig).toHaveBeenCalled()
    expect(mockServer.ws.send).toHaveBeenCalledWith({
      type: 'custom',
      event: 'unocss:config-changed',
    })
  })

  it('should not reload when paths resolve to different files', async () => {
    const ctx = createMockContext(['/test/project/uno.config.js'])
    const plugin = ConfigHMRPlugin(ctx)

    if (plugin?.configureServer) {
      await (plugin.configureServer as any)(mockServer)
    }

    const changeHandler = mockWatcher.on.mock.calls.find(
      call => call[0] === 'change',
    )?.[1]

    // Mock resolve to return different paths
    mockResolve
      .mockReturnValueOnce('/test/project/other-file.js') // Changed file
      .mockReturnValueOnce('/test/project/uno.config.js') // Source

    await changeHandler!('/test/project/other-file.js')

    expect(ctx.reloadConfig).not.toHaveBeenCalled()
    expect(mockServer.ws.send).not.toHaveBeenCalled()
  })
})
