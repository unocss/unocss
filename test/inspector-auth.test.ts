import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { connectDevframe } = vi.hoisted(() => ({ connectDevframe: vi.fn() }))
vi.mock('devframe/client', () => ({ connectDevframe }))

function createClient(options: { supportsRequestCode?: boolean, status?: string } = {}) {
  const listeners = new Map<string, (...args: any[]) => void>()
  const rpc = {
    status: options.status ?? 'unauthorized',
    isTrusted: options.status === 'connected',
    connectionMeta: {
      jsonSerializableMethods: options.supportsRequestCode === false
        ? ['anonymous:devframe:auth', 'anonymous:devframe:auth:exchange']
        : ['anonymous:devframe:auth', 'anonymous:devframe:auth:exchange', 'anonymous:devframe:auth:request-code'],
    } as { jsonSerializableMethods?: string[] },
    events: { on: (name: string, handler: (...args: any[]) => void) => listeners.set(name, handler) },
    requestAuthCode: vi.fn().mockResolvedValue(undefined),
    requestTrustWithCode: vi.fn().mockResolvedValue(false),
    close: vi.fn(),
    scope: () => ({ rpc: { sharedState: vi.fn().mockResolvedValue({
      value: () => ({ revision: 0, module: '' }),
      on: vi.fn(),
    }) } }),
    emitStatus(status: string) {
      rpc.status = status
      listeners.get('connection:status')?.(status)
    },
  }
  return rpc
}

async function load(rpc = createClient()) {
  connectDevframe.mockResolvedValue(rpc)
  const auth = await import('../packages-integrations/inspector/client/composables/rpc')
  await vi.waitFor(() => expect(auth.connectionStatus.value).toBe(rpc.status))
  return auth
}

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('inspector authentication', () => {
  it('requests a terminal code when the initial handshake has already refused trust', async () => {
    const rpc = createClient()
    await load(rpc)
    await vi.waitFor(() => expect(rpc.requestAuthCode).toHaveBeenCalledExactlyOnceWith({ reissue: false }))
  })

  it('waits for the stored-token handshake before requesting a code', async () => {
    const rpc = createClient({ status: 'connecting' })
    await load(rpc)
    expect(rpc.requestAuthCode).not.toHaveBeenCalled()
    rpc.emitStatus('unauthorized')
    await vi.waitFor(() => expect(rpc.requestAuthCode).toHaveBeenCalledOnce())
  })

  it('leaves code printing to pre-0.9.14 hosts', async () => {
    const rpc = createClient({ supportsRequestCode: false })
    const auth = await load(rpc)
    expect(auth.canRequestAuthCode.value).toBe(false)
    await auth.requestAuthCode(true)
    expect(rpc.requestAuthCode).not.toHaveBeenCalled()
    rpc.requestTrustWithCode.mockResolvedValue(true)
    expect(await auth.submitAuthCode(' 123456 ')).toBe(true)
    expect(rpc.requestTrustWithCode).toHaveBeenCalledWith('123456')
  })

  it('does not request a code for trusted or static clients', async () => {
    const rpc = createClient({ status: 'connected' })
    const auth = await load(rpc)
    await auth.requestAuthCode(true)
    expect(rpc.requestAuthCode).not.toHaveBeenCalled()
  })

  it('requests a code when a modern host omits the method list', async () => {
    const rpc = createClient()
    delete rpc.connectionMeta.jsonSerializableMethods
    await load(rpc)
    await vi.waitFor(() => expect(rpc.requestAuthCode).toHaveBeenCalledOnce())
  })

  it('probes legacy hosts without a method list only once per connection', async () => {
    const rpc = createClient()
    delete rpc.connectionMeta.jsonSerializableMethods
    rpc.requestAuthCode.mockRejectedValue(new Error('[birpc] function "anonymous:devframe:auth:request-code" not found'))
    const auth = await load(rpc)
    await vi.waitFor(() => expect(auth.canRequestAuthCode.value).toBe(false))
    expect(auth.authError.value).toBeNull()
    await auth.requestAuthCode(true)
    await auth.submitAuthCode('123456')
    expect(rpc.requestAuthCode).toHaveBeenCalledOnce()
    expect(auth.authError.value).toContain('Invalid or expired code')
  })

  it('does not request a code when a stored token is accepted later', async () => {
    const rpc = createClient({ status: 'connecting' })
    await load(rpc)
    rpc.isTrusted = true
    rpc.emitStatus('connected')
    expect(rpc.requestAuthCode).not.toHaveBeenCalled()
  })

  it('reissues a code only on an explicit request', async () => {
    const rpc = createClient()
    const auth = await load(rpc)
    await vi.waitFor(() => expect(auth.isRequestingAuthCode.value).toBe(false))
    await auth.requestAuthCode(true)
    expect(rpc.requestAuthCode.mock.calls).toEqual([[{ reissue: false }], [{ reissue: true }]])
  })

  it('prints a fresh code after an invalid exchange without forcing rotation', async () => {
    const rpc = createClient()
    const auth = await load(rpc)
    await vi.waitFor(() => expect(auth.isRequestingAuthCode.value).toBe(false))
    expect(await auth.submitAuthCode('123456')).toBe(false)
    expect(rpc.requestAuthCode).toHaveBeenLastCalledWith({ reissue: false })
    expect(rpc.requestAuthCode).toHaveBeenCalledTimes(2)
    expect(auth.authError.value).toContain('Invalid or expired code')
  })

  it('surfaces request failures and permits retry', async () => {
    const rpc = createClient()
    rpc.requestAuthCode.mockRejectedValueOnce(new Error('Code request failed'))
    const auth = await load(rpc)
    await vi.waitFor(() => expect(auth.authError.value).toBe('Code request failed'))
    await auth.requestAuthCode(true)
    expect(auth.authError.value).toBeNull()
    expect(auth.isRequestingAuthCode.value).toBe(false)
  })

  it('coalesces code requests while one is pending', async () => {
    const rpc = createClient()
    const pending = Promise.withResolvers<void>()
    rpc.requestAuthCode.mockReturnValueOnce(pending.promise)
    const auth = await load(rpc)
    await vi.waitFor(() => expect(auth.isRequestingAuthCode.value).toBe(true))
    await auth.requestAuthCode(true)
    expect(rpc.requestAuthCode).toHaveBeenCalledOnce()
    pending.resolve()
    await vi.waitFor(() => expect(auth.isRequestingAuthCode.value).toBe(false))
  })

  it('requests a code again after reconnecting to an untrusted host', async () => {
    const rpc = createClient()
    const auth = await load(rpc)
    await vi.waitFor(() => expect(auth.isRequestingAuthCode.value).toBe(false))
    vi.useFakeTimers()
    const next = createClient()
    connectDevframe.mockResolvedValueOnce(next)
    rpc.emitStatus('disconnected')
    await vi.advanceTimersByTimeAsync(2000)
    expect(rpc.close).toHaveBeenCalledOnce()
    expect(next.requestAuthCode).toHaveBeenCalledExactlyOnceWith({ reissue: false })
  })
})
