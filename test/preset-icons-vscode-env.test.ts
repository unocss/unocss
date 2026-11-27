import type { IconsAPI } from '@unocss/preset-icons'
import { createGenerator } from '@unocss/core'
import { afterEach, describe, expect, it, vi } from 'vitest'

function clearVscodeEnv() {
  vi.unstubAllEnvs()
  delete process.env.VSCODE_CWD
  delete process.env.ELECTRON_RUN_AS_NODE
  delete process.env.ESLINT
}

async function createIconsGenerator() {
  const { default: presetIcons } = await import('@unocss/preset-icons')
  return createGenerator({ presets: [presetIcons()] })
}

describe('preset-icons VS Code env', () => {
  afterEach(() => {
    clearVscodeEnv()
    vi.resetModules()
  })

  it('loads icons from node when only VSCODE_CWD is set', async () => {
    clearVscodeEnv()
    vi.stubEnv('VSCODE_CWD', '/workspace/project')
    const uno = await createIconsGenerator()
    const api = uno.config.presets.find(p => p.name === '@unocss/preset-icons')?.api as IconsAPI
    const parsed = await api.parseIcon('mdi:alarm')
    expect(parsed).toBeTruthy()
    expect(parsed?.name).toBe('alarm')
  })

  it('skips node resolution in extension host (ELECTRON_RUN_AS_NODE)', async () => {
    clearVscodeEnv()
    vi.stubEnv('ELECTRON_RUN_AS_NODE', '1')
    const uno = await createIconsGenerator()
    const api = uno.config.presets.find(p => p.name === '@unocss/preset-icons')?.api as IconsAPI
    const parsed = await api.parseIcon('mdi:alarm')
    expect(parsed).toBeFalsy()
  })

  it('eSLint negative control skips node resolution', async () => {
    clearVscodeEnv()
    vi.stubEnv('ESLINT', '1')
    const uno = await createIconsGenerator()
    const api = uno.config.presets.find(p => p.name === '@unocss/preset-icons')?.api as IconsAPI
    const parsed = await api.parseIcon('mdi:alarm')
    expect(parsed).toBeFalsy()
  })
})
