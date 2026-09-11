import type { DevframeConnectionStatus, DevframeRpcClient } from 'devframe/client'
import type { InspectorChanges } from '../../types'
import { connectDevframe } from 'devframe/client'
import { ref } from 'vue'

export const connectionStatus = ref<DevframeConnectionStatus>('connecting')
export const isTrusted = ref(false)
export const authError = ref<string | null>(null)
export const canRequestAuthCode = ref(false)
export const isRequestingAuthCode = ref(false)

/**
 * Reactive change signal mirrored from the server's `changes` shared state.
 * Every extraction/config/module change bumps `changeRevision`; watch it to
 * refetch. A reconnecting client receives the latest snapshot for free.
 */
export const changeRevision = ref(0)
export const changedModule = ref('')

const RECONNECT_INTERVAL = 2000
const REQUEST_CODE_METHOD = 'anonymous:devframe:auth:request-code'

let client: DevframeRpcClient | undefined
let connectPromise: Promise<DevframeRpcClient> | undefined
let reconnectTimer: ReturnType<typeof setTimeout> | undefined

async function connect(): Promise<DevframeRpcClient> {
  connectionStatus.value = 'connecting'
  // The standalone client dev server (`dev:client`) runs the backend on a
  // side-car the client connects to directly over an absolute URL, with the
  // connection descriptor injected so it skips the cross-origin discovery
  // fetch. Every other host shares an origin with the SPA, so the default
  // (relative to the page, auto-discovered) is correct.
  const devBase = import.meta.env.VITE_INSPECTOR_RPC_BASE
  const devMeta = import.meta.env.VITE_INSPECTOR_RPC_META
  const rpc = await connectDevframe({
    // The inspector renders its own auth screen (see AuthGate.vue)
    simpleAuth: false,
    baseURL: devBase || undefined,
    connectionMeta: devMeta ? JSON.parse(devMeta) : undefined,
  })
  client = rpc

  isTrusted.value = !!rpc.isTrusted
  authError.value = null
  isRequestingAuthCode.value = false
  // Some hosts omit the method list (e.g. initDevframe/Next.js). Probe once
  // in that case; pre-0.9.14 hosts reject the method and print automatically.
  canRequestAuthCode.value = rpc.connectionMeta.jsonSerializableMethods?.includes(REQUEST_CODE_METHOD) ?? true

  const scoped = rpc.scope('unocss')

  // Mirror the server's `changes` shared state into reactive refs. Gated on
  // trust because the initial sync is an RPC call; a reconnecting client
  // re-reads the snapshot, so a revision bumped while it was away triggers a
  // refetch on return.
  let subscribed = false
  async function subscribeChanges() {
    if (subscribed || !rpc.isTrusted)
      return
    subscribed = true
    const state = await scoped.rpc.sharedState('changes', {
      initialValue: { revision: 0, module: '' } satisfies InspectorChanges,
    })
    const apply = (s: InspectorChanges) => {
      changedModule.value = s.module
      changeRevision.value = s.revision
    }
    apply(state.value() as InspectorChanges)
    state.on('updated', apply as any)
  }

  function updateStatus(status: DevframeConnectionStatus) {
    connectionStatus.value = status
    if (status === 'unauthorized')
      requestAuthCode()
    if (status === 'disconnected' || status === 'error')
      scheduleReconnect()
  }
  rpc.events.on('connection:status', updateStatus)
  updateStatus(rpc.status)
  rpc.events.on('rpc:is-trusted:updated', (trusted) => {
    isTrusted.value = trusted
    subscribeChanges()
  })

  // When the backend runs with auth disabled (the `dev:client` playground),
  // the server auto-trusts every connection — proactively request trust so
  // the UI unlocks without showing the code prompt. Harmless elsewhere: with
  // a persisted token it re-validates, otherwise it resolves false and the
  // auth screen stays up for the user to enter a code.
  if (devBase)
    rpc.requestTrust().catch(() => {})

  subscribeChanges()

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

const SHIKI_SERVICE = '@devframes/service-shiki'

/**
 * Highlight code to dual-theme HTML through the host's Shiki wire service,
 * so the client doesn't bundle its own highlighter. Returns `null` when the
 * service isn't available (e.g. a static build) so callers can fall back to
 * plain text.
 */
export async function shikiHighlight(code: string, lang: string): Promise<string | null> {
  const rpc = await ensureClient()
  await rpc.ensureTrusted(0)
  const service = rpc.services.get(SHIKI_SERVICE)
  if (!service)
    return null
  const { html } = await service.rpc.call('highlight', { code, lang })
  return html
}

/**
 * Ask a supporting host to print its code. Only explicit reissue requests
 * rotate a still-valid code; ordinary requests are deduplicated by the host.
 */
export async function requestAuthCode(reissue = false): Promise<void> {
  const rpc = client
  if (!rpc || rpc.status !== 'unauthorized' || rpc.isTrusted || !canRequestAuthCode.value || isRequestingAuthCode.value)
    return
  isRequestingAuthCode.value = true
  authError.value = null
  try {
    await rpc.requestAuthCode({ reissue })
  }
  catch (error: any) {
    if (client === rpc) {
      if (error?.message === `[birpc] function "${REQUEST_CODE_METHOD}" not found`)
        canRequestAuthCode.value = false
      else
        authError.value = error?.message ?? String(error)
    }
  }
  finally {
    if (client === rpc)
      isRequestingAuthCode.value = false
  }
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
    if (!ok) {
      await requestAuthCode()
      authError.value ||= 'Invalid or expired code. Check your dev server terminal for a fresh one.'
    }
    return ok
  }
  catch (error: any) {
    authError.value = error?.message ?? String(error)
    return false
  }
}

// Kick off the connection eagerly so the auth state is known ASAP
ensureClient().catch(() => {})
