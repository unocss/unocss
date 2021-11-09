import { UserConfigDefaults, createGenerator, UserConfig } from '@unocss/core'

declare global {
  interface Window {
    __unocss?: UserConfig
  }
}

export function initUnocssRuntime(defaults?: UserConfigDefaults) {
  window.addEventListener('load', init)

  function init() {
    const el = document.createElement('style')
    document.head.appendChild(el)

    const uno = createGenerator(window.__unocss || {}, defaults)
    const tokens = new Set<string>()

    let _timer: number | undefined
    function scheduleUpdate() {
      if (_timer != null)
        clearTimeout(_timer)
      _timer = setTimeout(updateStyle, 0) as any
    }

    async function updateStyle() {
      const result = await uno.generate(tokens)
      el.innerHTML = result.css
    }

    async function extract(str: string) {
      await uno.applyExtractors(str, undefined, tokens)
      scheduleUpdate()
    }

    function extractAll() {
      extract(document.body.outerHTML)
    }

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target as Element
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
  }
}
