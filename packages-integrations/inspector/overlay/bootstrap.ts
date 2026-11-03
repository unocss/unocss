/** Keep the overlay and its RPC connection out of embedded documents. */
export function startInspector(mount: () => void, targetWindow: Window = window) {
  if (targetWindow.self !== targetWindow.top)
    return

  const document = targetWindow.document
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', mount, { once: true })
  else
    mount()
}
