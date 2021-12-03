import { UserConfigDefaults, createGenerator, UserConfig } from '@unocss/core'

export interface RuntimeOptions {
  /**
   * Default config of UnoCSS
   */
  defaults?: UserConfigDefaults
}

declare global {
  interface Window {
    __unocss?: UserConfig & { runtime?: RuntimeOptions }
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

  mutationObserver.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    attributes: true,
  })

  extractAll()
  window.addEventListener('load', extractAll)
  window.addEventListener('DOMContentLoaded', extractAll)
}
