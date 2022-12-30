import type { GenerateResult, UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import { createGenerator, isString, toArray } from '@unocss/core'
import { autoPrefixer, decodeHtml } from './utils'

export interface RuntimeOptions {
  /**
   * Default config of UnoCSS
   */
  defaults?: UserConfigDefaults
  /**
   * Enable css property auto prefixer
   * @default false
   */
  autoPrefix?: boolean
  /**
   * Attribute to use as cloaking
   * @default 'un-cloak'
   */
  cloakAttribute?: string
  /**
   * Callback to modify config
   */
  configResolved?: (config: UserConfig, defaults: UserConfigDefaults) => void
  /**
   * Callback when the runtime is ready. Returning false will prevent default extraction
   */
  ready?: (runtime: RuntimeContext) => false | any
}

export type RuntimeInspectorCallback = (element: Element) => boolean

export interface RuntimeContext {
  /**
   * The UnoCSS instance.
   *
   * @type {UnoGenerator}
   */
  uno: UnoGenerator

  /**
   * Run extractor on specified tokens
   *
   * @returns {Promise<void>}
   */
  extract: (tokens: string | string[]) => Promise<void>

  /**
   * Rerun extractor on the whole <body>, regardless of paused status or inspection limitation.
   *
   * @returns {Promise<void>}
   */
  extractAll: () => Promise<void>

  /**
   * Set/unset inspection callback to allow/ignore element to be extracted.
   *
   * @param {RuntimeInspectorCallback} [callback] - Callback to determine whether the element will be extracted.
   *
   * @returns {void}
   */
  inspect: (callback?: RuntimeInspectorCallback) => void

  /**
   * Pause/resume/toggle the runtime.
   *
   * @param {boolean} [state] - False or True respectively pause or resume the runtime. Undefined parameter toggles the pause/resume state.
   *
   * @returns {void}
   */
  toggleObserver: (state?: boolean) => void

  /**
   * Manually run the update cycle.
   *
   * @returns {GenerateResult & { styleElement: HTMLStyleElement}}
   */
  update: () => Promise<GenerateResult & { styleElement: HTMLStyleElement }>

  /**
   * The UnoCSS version.
   *
   * @type {string}
   */
  version: string
}

declare global {
  interface Window {
    __unocss?: UserConfig & { runtime?: RuntimeOptions }
    __unocss_runtime?: RuntimeContext
  }
}

export default function init(inlineConfig: RuntimeOptions = {}) {
  if (typeof window == 'undefined') {
    console.warn('@unocss/runtime been used in non-browser environment, skipped.')
    return
  }

  const defaultWindow = window
  const defaultDocument = document

  const userConfig = defaultWindow.__unocss || {}
  const runtimeOptions = Object.assign({}, inlineConfig, userConfig.runtime)
  const userConfigDefaults = runtimeOptions.defaults || {}
  const cloakAttribute = runtimeOptions.cloakAttribute ?? 'un-cloak'
  if (runtimeOptions.autoPrefix) {
    const postprocessors = userConfigDefaults.postprocess = toArray(userConfigDefaults.postprocess)
    postprocessors.unshift(autoPrefixer(defaultDocument.createElement('div').style))
  }

  runtimeOptions.configResolved?.(userConfig, userConfigDefaults)
  const uno = createGenerator(userConfig, userConfigDefaults)

  let paused = true
  let tokens = new Set<string>()
  let styleElement: HTMLStyleElement | undefined
  let inspector: RuntimeInspectorCallback | undefined

  let _timer: number | undefined
  let _resolvers: Function[] = []
  const scheduleUpdate = () => new Promise((resolve) => {
    _resolvers.push(resolve)
    if (_timer != null)
      clearTimeout(_timer)
    _timer = setTimeout(() => updateStyle().then(() => {
      const resolvers = _resolvers
      _resolvers = []
      resolvers.forEach(r => r())
    }), 0) as any
  })

  function removeCloak(node: Node) {
    if (node.nodeType !== 1)
      return
    const el = node as Element
    if (el.hasAttribute(cloakAttribute))
      el.removeAttribute(cloakAttribute)
    el.querySelectorAll(`[${cloakAttribute}]`).forEach((n) => {
      n.removeAttribute(cloakAttribute)
    })
  }

  function getStyleElement() {
    if (!styleElement) {
      styleElement = defaultDocument.createElement('style')
      defaultDocument.documentElement.prepend(styleElement)
    }
    return styleElement
  }

  async function updateStyle() {
    const result = await uno.generate(tokens)
    const styleElement = getStyleElement()
    styleElement.innerHTML = result.css
    tokens = result.matched
    return {
      ...result,
      styleElement,
    }
  }

  async function extract(str: string) {
    const tokenSize = tokens.size
    await uno.applyExtractors(str, undefined, tokens)
    if (tokenSize !== tokens.size)
      await scheduleUpdate()
  }

  async function extractAll() {
    const body = defaultDocument.body
    const html = body && body.outerHTML
    if (html) {
      await extract(`${html} ${decodeHtml(html)}`)
      removeCloak(defaultDocument.documentElement)
      removeCloak(body)
    }
  }

  const mutationObserver = new MutationObserver((mutations) => {
    if (paused)
      return
    mutations.forEach(async (mutation) => {
      if (mutation.target.nodeType !== 1)
        return
      const target = mutation.target as Element
      if (target === styleElement)
        return
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(async (node) => {
          if (node.nodeType !== 1)
            return
          const el = node as Element
          if (inspector && !inspector(el))
            return
          await extract(el.outerHTML)
          removeCloak(el)
        })
      }
      else {
        if (inspector && !inspector(target))
          return
        if (mutation.attributeName !== cloakAttribute) {
          const attrs = Array.from(target.attributes)
            .map(i => i.value ? `${i.name}="${i.value}"` : i.name)
            .join(' ')
          const tag = `<${target.tagName.toLowerCase()} ${attrs}>`
          await extract(tag)
        }
        if (target.hasAttribute(cloakAttribute))
          target.removeAttribute(cloakAttribute)
      }
    })
  })

  let observing = false
  function observe() {
    if (observing)
      return
    const target = defaultDocument.documentElement || defaultDocument.body
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

  function ready() {
    if (defaultDocument.readyState === 'loading')
      defaultWindow.addEventListener('DOMContentLoaded', execute)
    else
      execute()
  }

  const unoCssRuntime = defaultWindow.__unocss_runtime = defaultWindow.__unocss_runtime = {
    version: uno.version,
    uno,
    async extract(userTokens) {
      if (!isString(userTokens)) {
        userTokens.forEach(t => tokens.add(t))
        userTokens = ''
      }
      await extract(userTokens)
    },
    extractAll,
    inspect(callback) {
      inspector = callback
    },
    toggleObserver(set) {
      if (set === undefined)
        paused = !paused
      else
        paused = !!set
      if (!observing && !paused)
        ready()
    },
    update: updateStyle,
  }

  if (runtimeOptions.ready?.(unoCssRuntime) !== false) {
    paused = false
    ready()
  }
}
