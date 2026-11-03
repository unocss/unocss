// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { startInspector } from '../overlay/bootstrap'

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('overlay bootstrap', () => {
  it('starts in a ready top-level page', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
    const mount = vi.fn()
    startInspector(mount)
    expect(mount).toHaveBeenCalledOnce()
  })

  it('waits for the top-level document and starts only once', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    const mount = vi.fn()
    startInspector(mount)
    expect(mount).not.toHaveBeenCalled()
    document.dispatchEvent(new Event('DOMContentLoaded'))
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(mount).toHaveBeenCalledOnce()
  })

  it.each(['loading', 'complete'] as const)('does not load the UI or RPC in a %s iframe', (readyState) => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    const frameWindow = iframe.contentWindow!
    vi.spyOn(frameWindow.document, 'readyState', 'get').mockReturnValue(readyState)
    const mount = vi.fn()
    const listen = vi.spyOn(frameWindow.document, 'addEventListener')

    startInspector(mount, frameWindow)
    frameWindow.document.dispatchEvent(new Event('DOMContentLoaded'))

    expect(mount).not.toHaveBeenCalled()
    expect(listen).not.toHaveBeenCalled()
  })
})
