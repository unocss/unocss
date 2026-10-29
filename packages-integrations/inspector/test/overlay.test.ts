// @vitest-environment jsdom
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { isTrusted, rpcCall } from '../overlay/client-rpc'
import { getBoxModel } from '../overlay/composables/box-model'
import { useSelection } from '../overlay/composables/selection'
import { createOverlayPlugin } from '../src/overlay'

vi.mock('../overlay/client-rpc', async () => {
  const { ref } = await import('vue')
  return { changeRevision: ref(0), isTrusted: ref(false), rpcCall: vi.fn() }
})

let app: App | undefined
let selection: ReturnType<typeof useSelection>

beforeEach(() => {
  isTrusted.value = false
  vi.mocked(rpcCall).mockReset()
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  })
  const container = document.createElement('div')
  document.body.appendChild(container)
  app = createApp({
    setup() {
      selection = useSelection()
      return () => h('div')
    },
  })
  app.mount(container)
})

afterEach(() => {
  app?.unmount()
  document.body.replaceChildren()
  document.body.style.cursor = ''
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('element inspector overlay', () => {
  it('selects page elements, consumes the selected click, and restores the cursor', async () => {
    document.body.style.cursor = 'help'
    const target = document.createElement('button')
    const click = vi.fn()
    target.addEventListener('click', click)
    document.body.appendChild(target)
    selection.startSelecting()
    expect(document.body.style.cursor).toBe('crosshair')

    target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }))
    expect(selection.selectedElement.value).toBe(target)
    target.click()
    expect(click).not.toHaveBeenCalled()
    expect(selection.isSelecting.value).toBe(false)
    expect(document.body.style.cursor).toBe('help')
    await nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(selection.selectedElement.value).toBeNull()
    target.click()
    expect(click).toHaveBeenCalledOnce()
  })

  it('leaves shadow-root controls usable while selecting and cleans up on unmount', () => {
    const host = document.createElement('div')
    host.id = 'unocss-inspector-root'
    const button = document.createElement('button')
    host.attachShadow({ mode: 'open' }).appendChild(button)
    document.body.appendChild(host)
    const click = vi.fn()
    button.addEventListener('click', click)
    document.body.style.cursor = 'help'
    selection.startSelecting()
    button.click()
    expect(click).toHaveBeenCalledOnce()
    expect(selection.selectedElement.value).toBeNull()
    expect(selection.isSelecting.value).toBe(true)
    app!.unmount()
    app = undefined
    expect(document.body.style.cursor).toBe('help')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'u', ctrlKey: true }))
    expect(document.body.style.cursor).toBe('help')
  })

  it('toggles selection with Ctrl+U and prevents the browser shortcut', () => {
    const event = new KeyboardEvent('keydown', { key: 'u', ctrlKey: true, cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(selection.isSelecting.value).toBe(true)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'u', metaKey: true }))
    expect(selection.isSelecting.value).toBe(false)
  })

  it('calculates content bounds including borders and non-numeric margins', () => {
    const element = document.createElement('div')
    element.style.cssText = 'margin: auto; padding: 10px; border: 2px solid'
    document.body.appendChild(element)
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top: 20, left: 30, width: 100, height: 80 } as DOMRect)
    const box = getBoxModel(element)
    expect(box.containerTop).toBe(20)
    expect(box.paddingWidth).toBe(96)
    expect(box.contentWidth).toBe(76)
    expect(box.contentHeight).toBe(56)
  })

  it('generates CSS for edited utilities after authorization and disposes the preview', async () => {
    vi.useFakeTimers()
    vi.mocked(rpcCall).mockResolvedValue({ css: '.flex{display:flex}' })
    const target = document.createElement('div')
    document.body.appendChild(target)
    selection.startSelecting()
    target.click()
    await nextTick()
    expect(rpcCall).not.toHaveBeenCalled()

    isTrusted.value = true
    await nextTick()
    await vi.advanceTimersByTimeAsync(100)
    expect(document.head.querySelector('[data-unocss-inspector]')?.textContent).toContain('display:flex')

    target.classList.add('flex')
    await nextTick()
    await vi.advanceTimersByTimeAsync(100)
    expect(vi.mocked(rpcCall).mock.calls.at(-1)?.[1]).toContain('class="flex"')
    app!.unmount()
    app = undefined
    expect(document.head.querySelector('[data-unocss-inspector]')).toBeNull()
  })

  it('injects only in development and uses the inspector mount with a non-root Vite base', async () => {
    const plugin = createOverlayPlugin()
    expect(plugin.apply).toBe('serve')
    const hook = plugin.transformIndexHtml as { handler: (html: string, context: any) => any }
    const tags = await hook.handler('', { server: { config: { base: '/play/' } } })
    expect(tags[0].attrs.src).toBe('/__unocss/overlay/index.js')
  })
})
