import type { ElementContext } from './exports/element'
import { computed, onScopeDispose, watch } from 'vue'
import { changeRevision, isTrusted, rpcCall } from '../client-rpc'

/** Generate utilities introduced by DOM edits with the application's config. */
export function useLiveStyles(context: ElementContext) {
  const inputs = new Set<string>()
  let style: HTMLStyleElement | undefined
  const input = computed(() => {
    context.tracking()
    const element = context.element.value?.cloneNode(false) as HTMLElement | undefined
    return element?.outerHTML ?? ''
  })

  watch([input, isTrusted, changeRevision], ([html, trusted], _old, cleanup) => {
    if (!html || !trusted)
      return
    inputs.add(html)
    let stale = false
    const timer = setTimeout(async () => {
      try {
        const result = await rpcCall<{ css: string }>('generate-repl', Array.from(inputs).join('\n'), false)
        if (stale)
          return
        style ??= document.createElement('style')
        style.dataset.unocssInspector = ''
        style.textContent = result.css
        if (!style.isConnected)
          document.head.appendChild(style)
        context.triggering()
      }
      catch (error) {
        console.warn('[unocss:inspector] Failed to preview edited utilities:', error)
      }
    }, 100)
    cleanup(() => {
      stale = true
      clearTimeout(timer)
    })
  }, { immediate: true })

  onScopeDispose(() => style?.remove())
}
