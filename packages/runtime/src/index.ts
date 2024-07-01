import type { GenerateResult, UnoGenerator, UserConfig, UserConfigDefaults } from '@unocss/core'
import { createGenerator, isString, toArray } from '@unocss/core'
import { autoPrefixer, decodeHtml } from './utils'

export interface RuntimeGenerateResult extends GenerateResult {
  getStyleElement: (name: string) => HTMLStyleElement | undefined
  getStyleElements: () => Map<string, HTMLStyleElement>
}

export interface RuntimeObserverConfig {
  /**
   * A function that returns an HTML Element for the MutationObserver to watch.
   * Defaults to the same as rootElement
   */
  target?: () => Element
  /**
   * An array of attribute names for the MutationObserver to limit which attributes
   * are watched for mutations.
   */
  attributeFilter?: Array<string>
}

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
   * Optional function to control UnoCSS style element(s) injection into DOM.
   * When provided, the default injection logic will be overridden.
   */
  inject?: (styleElement: HTMLStyleElement) => void
  /**
   * Callback when the runtime is ready. Returning false will prevent default extraction
   */
  ready?: (runtime: RuntimeContext) => false | any
  /**
   * Runtime MutationObserver configuration options
   */
  observer?: RuntimeObserverConfig
  /**
   * When enabled, UnoCSS will look for the existing selectors defined in the stylesheet and bypass them.
   * This is useful when using the runtime alongwith the build-time UnoCSS.
   */
  bypassDefined?: boolean
  /**
   * Optional function to control the root element to extract.
   */
  rootElement?: () => Element | undefined
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
  extractAll: (target?: Element) => Promise<void>

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
   * @returns {RuntimeGenerateResult}
   */
  update: () => Promise<RuntimeGenerateResult>

  /**
   * Loaded presets
   *
   * @type {Record<string, Function>}
   */
  presets: Record<string, Function>

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
  const defaultDocument = window.document
  const html = () => defaultDocument.documentElement

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
  const inject = (styleElement: HTMLStyleElement) => runtimeOptions.inject ? runtimeOptions.inject(styleElement) : html().prepend(styleElement)
  const rootElement = () => runtimeOptions.rootElement ? runtimeOptions.rootElement() : defaultDocument.body
  const styleElements = new Map<string, HTMLStyleElement>()

  let paused = true
  const tokens = new Set<string>()
  let inspector: RuntimeInspectorCallback | undefined

  let _timer: number | undefined
  let _resolvers: ((arg?: any) => any)[] = []
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

  function removeCloak(node: Node, isAll = false) {
    if (node.nodeType !== 1)
      return
    const el = node as Element
    if (el.hasAttribute(cloakAttribute))
      el.removeAttribute(cloakAttribute)
    isAll && el.querySelectorAll(`[${cloakAttribute}]`).forEach((n) => {
      n.removeAttribute(cloakAttribute)
    })
  }

  function getStyleElement(layer: string, previousLayer?: string) {
    let styleElement = styleElements.get(layer)

    if (!styleElement) {
      styleElement = defaultDocument.createElement('style')
      styleElement.setAttribute('data-unocss-runtime-layer', layer)
      styleElements.set(layer, styleElement)

      if (previousLayer == null) {
        inject(styleElement)
      }
      else {
        const previousStyle = getStyleElement(previousLayer)
        const parentNode = previousStyle.parentNode
        if (parentNode)
          parentNode.insertBefore(styleElement, previousStyle.nextSibling)
        else
          inject(styleElement)
      }
    }

    return styleElement
  }

  async function updateStyle() {
    const currentToken = [...tokens]
    const result = await uno.generate(currentToken)

    result.layers.reduce((previous: string | undefined, current) => {
      getStyleElement(current, previous).innerHTML = result.getLayer(current) ?? ''
      return current
    }, undefined)

    const clearTokens = currentToken.filter(i => !result.matched.has(i))
    clearTokens.forEach(t => tokens.delete(t))

    return {
      ...result,
      getStyleElement: (layer: string) => styleElements.get(layer),
      getStyleElements: () => styleElements,
    }
  }

  async function extract(str: string) {
    const tokenSize = tokens.size
    await uno.applyExtractors(str, undefined, tokens)
    if (tokenSize !== tokens.size)
      await scheduleUpdate()
  }

  async function extractAll(target = rootElement()) {
    const outerHTML = target && target.outerHTML
    if (outerHTML) {
      await extract(`${outerHTML} ${decodeHtml(outerHTML)}`)
      removeCloak(html())
      removeCloak(target, true)
    }
  }

  const mutationObserver = new MutationObserver((mutations) => {
    if (paused)
      return
    mutations.forEach(async (mutation) => {
      if (mutation.target.nodeType !== 1)
        return
      const target = mutation.target as Element
      for (const item of styleElements) {
        if (target === item[1])
          return
      }
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
        removeCloak(target)
      }
    })
  })

  let observing = false
  function observe() {
    if (observing)
      return
    const target = runtimeOptions.observer?.target ? runtimeOptions.observer.target() : rootElement()
    if (!target)
      return
    mutationObserver.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: runtimeOptions.observer?.attributeFilter,
    })
    observing = true
  }

  function execute() {
    if (runtimeOptions.bypassDefined)
      getDefinedCssSelectors(uno.blocked)
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
    presets: defaultWindow.__unocss_runtime?.presets ?? {},
  }

  if (runtimeOptions.ready?.(unoCssRuntime) !== false) {
    paused = false
    ready()
  }
}

/**
 * Read all defined css selectors, and add them to the blocked list
 */
function getDefinedCssSelectors(selectors = new Set<string>()) {
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i]
    let list
    try {
      list = sheet.cssRules || sheet.rules

      if (!list)
        continue

      Array.from(list)
        // @ts-expect-error missing types
        .flatMap(r => r.selectorText?.split(/,/g) || [])
        .forEach((s) => {
          if (!s)
            return
          s = s.trim()
          if (s.startsWith('.'))
            s = s.slice(1)
          selectors.add(s)
        })
    }
    catch (e) {
      continue
    }
  }
  return selectors
}
