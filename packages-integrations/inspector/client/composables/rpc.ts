import type { DevframeConnectionStatus, DevframeRpcClient } from 'devframe/client'
import type { ModuleUpdate } from '../../types'
import { connectDevframe } from 'devframe/client'

export const connectionStatus = ref<DevframeConnectionStatus>('connecting')
export const isTrusted = ref(false)
export const authError = ref<string | null>(null)

const _onModuleUpdated = createEventHook<ModuleUpdate>()
const _onConfigChanged = createEventHook<void>()
const _onInvalidated = createEventHook<void>()
const _onReconnected = createEventHook<void>()

export const onModuleUpdated = _onModuleUpdated.on
export const onConfigChanged = _onConfigChanged.on
export const onInvalidated = _onInvalidated.on
export const onReconnected = _onReconnected.on

const RECONNECT_INTERVAL = 2000

let client: DevframeRpcClient | undefined
let connectPromise: Promise<DevframeRpcClient> | undefined
let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let hadConnected = false

async function connect(): Promise<DevframeRpcClient> {
  connectionStatus.value = 'connecting'
  const rpc = await connectDevframe({
    // The inspector renders its own auth screen (see AuthGate.vue)
    simpleAuth: false,
  })
  client = rpc

  connectionStatus.value = rpc.status
  isTrusted.value = !!rpc.isTrusted

  rpc.events.on('connection:status', (status) => {
    connectionStatus.value = status
    if (status === 'disconnected' || status === 'error')
      scheduleReconnect()
  })
  rpc.events.on('rpc:is-trusted:updated', (trusted) => {
    isTrusted.value = trusted
  })

  const scoped = rpc.scope('unocss')
  scoped.rpc.register({
    name: 'on-module-updated',
    type: 'event',
    handler: (update: ModuleUpdate) => {
      _onModuleUpdated.trigger(update)
    },
  })
  scoped.rpc.register({
    name: 'on-config-changed',
    type: 'event',
    handler: () => {
      _onConfigChanged.trigger()
    },
  })
  scoped.rpc.register({
    name: 'on-invalidated',
    type: 'event',
    handler: () => {
      _onInvalidated.trigger()
    },
  })

  if (hadConnected) {
    rpc.ensureTrusted(0).then(() => _onReconnected.trigger())
  }
  hadConnected = true

  return rpc
}

function ensureClient(): Promise<DevframeRpcClient> {
  if (!connectPromise) {
    connectPromise = connect().catch((error) => {
      connectPromise = undefined
      connectionStatus.value = 'error'
      scheduleReconnect()
      throw error
    })
  }
  return connectPromise
}

/**
 * Devframe clients do not reconnect on their own — a closed client is done.
 * Poll for a fresh connection until the dev server is back.
 */
function scheduleReconnect() {
  if (reconnectTimer)
    return
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = undefined
    client?.close?.()
    client = undefined
    connectPromise = undefined
    try {
      await ensureClient()
    }
    catch {
      // `ensureClient` already re-arms the reconnect timer on failure
    }
  }, RECONNECT_INTERVAL)
}

/**
 * Wait for a connected and trusted client, then call a scoped RPC method.
 */
export async function rpcCall<T>(method: string, ...args: any[]): Promise<T> {
  const rpc = await ensureClient()
  await rpc.ensureTrusted(0)
  return await rpc.scope('unocss').rpc.call(method as any, ...args) as T
}

/**
 * Exchange the one-time code printed in the dev server terminal for a
 * persisted auth token.
 */
export async function submitAuthCode(code: string): Promise<boolean> {
  authError.value = null
  try {
    const rpc = await ensureClient()
    const ok = await rpc.requestTrustWithCode(code.trim())
    if (!ok)
      authError.value = 'Invalid or expired code. Check your dev server terminal for a fresh one.'
    return ok
  }
  catch (error: any) {
    authError.value = error?.message ?? String(error)
    return false
  }
}

// Kick off the connection eagerly so the auth state is known ASAP
ensureClient().catch(() => {})
