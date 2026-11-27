import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEnvFlags } from '#integration/env'

function clearVscodeEnv() {
  vi.unstubAllEnvs()
  delete process.env.VSCODE_CWD
  delete process.env.ELECTRON_RUN_AS_NODE
  delete process.env.VSCODE_EXTHOST_WILL_SEND_SOCKET
  delete process.env.VSCODE_WILL_SEND_MESSAGE_PORT
  delete process.env.ESLINT
}

describe('getEnvFlags / VS Code extension host detection', () => {
  afterEach(() => {
    clearVscodeEnv()
  })

  it('plain node terminal: node loader + jsx transform enabled', () => {
    clearVscodeEnv()
    const flags = getEnvFlags()
    expect(flags.isNode).toBeTruthy()
    expect(flags.isVSCode).toBe(false)
    expect(flags.isESLint).toBe(false)
    expect(!!flags.isNode && !flags.isVSCode && !flags.isESLint).toBe(true)
  })

  it('integrated terminal (VSCODE_CWD only): should not count as extension host', () => {
    clearVscodeEnv()
    vi.stubEnv('VSCODE_CWD', '/workspace/project')
    const flags = getEnvFlags()
    expect(flags.isVSCode).toBe(false)
    expect(!!flags.isNode && !flags.isVSCode && !flags.isESLint).toBe(true)
  })

  it('extension host (ELECTRON_RUN_AS_NODE): skip node-only integrations', () => {
    clearVscodeEnv()
    vi.stubEnv('ELECTRON_RUN_AS_NODE', '1')
    const flags = getEnvFlags()
    expect(flags.isVSCode).toBe(true)
    expect(!!flags.isNode && !flags.isVSCode && !flags.isESLint).toBe(false)
  })

  it('extension host bootstrap (VSCODE_EXTHOST_WILL_SEND_SOCKET)', () => {
    clearVscodeEnv()
    vi.stubEnv('VSCODE_EXTHOST_WILL_SEND_SOCKET', '1')
    expect(getEnvFlags().isVSCode).toBe(true)
  })

  it('eSLint negative control: still skips node icon loader, not treated as vscode', () => {
    clearVscodeEnv()
    vi.stubEnv('ESLINT', '1')
    const flags = getEnvFlags()
    expect(flags.isESLint).toBe(true)
    expect(flags.isVSCode).toBe(false)
    expect(!!flags.isNode && !flags.isVSCode && !flags.isESLint).toBe(false)
  })

  it('vSCODE_CWD with ESLINT: ESLint wins for loader, vscode cwd does not flip isVSCode', () => {
    clearVscodeEnv()
    vi.stubEnv('VSCODE_CWD', '/workspace')
    vi.stubEnv('ESLINT', '1')
    const flags = getEnvFlags()
    expect(flags.isESLint).toBe(true)
    expect(flags.isVSCode).toBe(false)
  })

  it('non-node environment', () => {
    const realProcess = globalThis.process
    vi.stubGlobal('process', undefined)
    try {
      expect(getEnvFlags().isNode).toBe(false)
      expect(getEnvFlags().isVSCode).toBe(false)
    }
    finally {
      vi.stubGlobal('process', realProcess)
    }
  })
})
