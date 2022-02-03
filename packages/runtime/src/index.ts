import type { UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { autoPrefixer } from './utils'

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

  const config = window.__unocss || {}
  const runtime = config?.runtime
  const defaultConfig = Object.assign(inlineConfig.defaults || {}, runtime)
  if (runtime?.autoPrefix) {
    let postprocess = defaultConfig.postprocess
    if (!postprocess)
      postprocess = []
    if (!Array.isArray(postprocess))
      postprocess = [postprocess]
    postprocess.unshift(autoPrefixer(document.createElement('div').style))
    defaultConfig.postprocess = postprocess
  }

  runtime?.configResolved?.(config, defaultConfig)

  let styleElement: HTMLStyleElement | undefined
  let paused = true
  let inspector: RuntimeInspectorCallback | undefined

  const uno = createGenerator(config, defaultConfig)
  const tokens = new Set<string>()

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

  async function updateStyle() {
    const result = await uno.generate(tokens)
    if (!styleElement) {
      styleElement = document.createElement('style')
      document.documentElement.prepend(styleElement)
    }
    styleElement.innerHTML = result.css
  }

  async function extract(str: string) {
    await uno.applyExtractors(str, undefined, tokens)
    await scheduleUpdate()
  }

  async function extractAll() {
    const html = document.body && document.body.outerHTML
    if (html)
      await extract(html)
  }

  const mutationObserver = new MutationObserver((mutations) => {
    if (paused)
      return
    mutations.forEach((mutation) => {
      const target = mutation.target as Element
      if (target === styleElement)
        return
      if (inspector && !inspector(target))
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

  function ready() {
    execute()
    window.addEventListener('load', execute)
    window.addEventListener('DOMContentLoaded', execute)
  }

  const unoCssRuntime = window.__unocss_runtime = window.__unocss_runtime = {
    version: uno.version,
    uno,
    async extract(userTokens) {
      if (typeof userTokens === 'string')
        return await extract(userTokens)
      userTokens.forEach(t => tokens.add(t))
      await updateStyle()
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
  }

  if (runtime?.ready?.(unoCssRuntime) !== false) {
    paused = false
    ready()
  }
}
