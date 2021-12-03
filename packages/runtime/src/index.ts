import { UnoGenerator, UserConfigDefaults, createGenerator, UserConfig } from '@unocss/core'

export interface RuntimeOptions {
  /**
   * Default config of UnoCSS
   */
  defaults?: UserConfigDefaults
}

declare global {
  interface Window {
    __unocss?: UserConfig & { runtime?: RuntimeOptions }
    __unocss_runtime?: { uno: UnoGenerator; extractAll: () => void; version: string }
  }
}

export default function init(options: RuntimeOptions = {}) {
  if (typeof window == 'undefined') {
    console.warn('@unocss/runtime been used in non-browser environment, skipped.')
    return
  }

  Object.assign(options, window.__unocss?.runtime)

  let el: HTMLStyleElement | undefined

  const uno = createGenerator(window.__unocss || {}, options.defaults)
  const tokens = new Set<string>()

  let _timer: number | undefined
  function scheduleUpdate() {
    if (_timer != null)
      clearTimeout(_timer)
    _timer = setTimeout(updateStyle, 0) as any
  }

  async function updateStyle() {
    const result = await uno.generate(tokens)
    if (!el) {
      el = document.createElement('style')
      document.head.appendChild(el)
    }
    el.innerHTML = result.css
  }

  async function extract(str: string) {
    await uno.applyExtractors(str, undefined, tokens)
    scheduleUpdate()
  }

  function extractAll() {
    if (document.body && document.body.outerHTML)
      extract(document.body.outerHTML)
  }

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const target = mutation.target as Element
      if (target === el)
        return
      const attrs = Array.from(target.attributes)
        .map(i => i.value ? `${i.name}="${i.value}"` : i.name)
        .join(' ')
      const tag = `<${target.tagName.toLowerCase()} ${attrs}>`
      extract(tag)
    })
  })

  let observing = false
  function observe() {
    if (!observing)
      return
    const target = document.documentElement || document.body
    if (!target)
      return
    mutationObserver.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
    })
    observing = true
  }

  function execute() {
    extractAll()
    observe()
  }

  window.__unocss_runtime = window.__unocss_runtime = {
    version: uno.version,
    uno,
    extractAll,
  }

  execute()
  window.addEventListener('load', execute)
  window.addEventListener('DOMContentLoaded', execute)
}
