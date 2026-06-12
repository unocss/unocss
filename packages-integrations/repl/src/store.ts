import type { UnocssAutocomplete } from '@unocss/autocomplete'
import type { GenerateResult, HighlightAnnotation, UnocssPluginContext, UserConfig } from '@unocss/core'
import type { InjectionKey, Ref, ShallowRef } from 'vue'
import type { ModuleCache, ModuleMap } from './evaluate-config'
import { createGenerator, noop } from '@unocss/core'
import { watchDebounced } from '@vueuse/core'
import MagicString from 'magic-string'
import { inject, provide, ref, shallowRef, watch } from 'vue'
import { evaluateUserConfig } from './evaluate-config'

export interface ReplOptions {
  transformHtml: boolean
  transformCustomCSS: boolean
  responsive: boolean
  width?: number
  height?: number
}

export interface ReplStoreOptions {
  /** Default HTML content for the HTML editor */
  defaultHTML?: string
  /** Default UnoCSS config string for the config editor */
  defaultConfigRaw?: string
  /** Default custom CSS string for the CSS editor */
  defaultCSS?: string
  /** CSS layer name for custom CSS */
  customCSSLayerName?: string
  /** Default REPL options */
  defaultOptions?: ReplOptions
  /**
   * Function to evaluate the user's config string into a UserConfig object.
   * If not provided, uses the built-in evaluateUserConfig with the provided moduleMap.
   */
  evaluateConfig?: (configStr: string) => Promise<UserConfig | undefined>
  /**
   * Module map for resolving imports in the config editor.
   * Used by the default evaluateConfig when no custom evaluateConfig is provided.
   */
  moduleMap?: ModuleMap
  /** Cache for resolved modules */
  modulesCache?: ModuleCache
  /** Base CSS reset string to inject as a preflight layer */
  resetCSS?: string
}

export interface ReplStore {
  // --- Input state (reactive, settable by editors) ---
  inputHTML: Ref<string>
  customConfigRaw: Ref<string>
  customCSS: Ref<string>
  options: Ref<ReplOptions>

  // --- Generated output (reactive) ---
  output: ShallowRef<GenerateResult | undefined>
  annotations: ShallowRef<HighlightAnnotation[] | undefined>
  transformedHTML: Ref<string>
  transformedCSS: Ref<string>
  customConfigError: Ref<Error | undefined>
  customCSSWarn: Ref<Error | undefined>
  /** True after the first generation completes */
  init: Ref<boolean>

  // --- UnoCSS engine access ---
  getUno: () => ReturnType<typeof createGenerator>
  getAutocomplete: () => Promise<UnocssAutocomplete>
}

const STORE_KEY: InjectionKey<ReplStore> = Symbol('unocss-repl-store')

function cleanOutput(code: string) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n\s+/g, '\n')
    .trim()
}

export function useStore(options: ReplStoreOptions = {}): ReplStore {
  const {
    defaultHTML = '',
    defaultConfigRaw = '',
    defaultCSS = '',
    customCSSLayerName = 'playground',
    defaultOptions = { transformHtml: false, transformCustomCSS: false, responsive: false },
    resetCSS = '',
  } = options

  // --- Input state ---
  const inputHTML = ref(defaultHTML)
  const customConfigRaw = ref(defaultConfigRaw)
  const customCSS = ref(defaultCSS)
  const optionsRef = ref<ReplOptions>({ ...defaultOptions })

  // --- Engine state ---
  const init = ref(false)
  const customConfigError = ref<Error>()
  const customCSSWarn = ref<Error>()
  const output = shallowRef<GenerateResult>()
  const annotations = shallowRef<HighlightAnnotation[]>()

  // --- Create the UnoCSS generator ---
  const __uno = createGenerator({}, {})

  // --- Config evaluation ---
  let customConfig: UserConfig = {}

  const _evaluateConfig = options.evaluateConfig
    || ((configStr: string) => evaluateUserConfig(configStr, options.moduleMap || new Map(), options.modulesCache))

  // --- Autocomplete ---
  let autocomplete: Promise<UnocssAutocomplete> = (async () => {
    const mod = options.moduleMap?.get('@unocss/autocomplete')
    if (mod) {
      return (await mod() as any).createAutocomplete(await __uno) as UnocssAutocomplete
    }
    // Fallback: dynamic import
    const { createAutocomplete } = await import('@unocss/autocomplete')
    return createAutocomplete(await __uno)
  })()

  function getUno() {
    return __uno
  }

  function getAutocomplete() {
    return autocomplete
  }

  // --- Transformer pipeline ---
  const transformed = shallowRef<{ output: string, annotations: HighlightAnnotation[] }>()
  const transformedHTML = ref('')
  const transformedCSS = ref('')

  async function applyTransformers(code: MagicString, id: string, enforce?: 'pre' | 'post') {
    const uno = await __uno
    let { transformers } = uno.config
    transformers = (transformers ?? []).filter((i: any) => i.enforce === enforce)

    if (!transformers.length)
      return []

    const annotations: HighlightAnnotation[] = []
    const fakePluginContext = { uno, invalidate: noop } as UnocssPluginContext
    for (const { idFilter, transform } of transformers) {
      if (idFilter && !idFilter(id))
        continue
      const result = await transform(code, id, fakePluginContext)
      const _annotations = result?.highlightAnnotations
      if (_annotations)
        annotations.push(..._annotations)
    }
    return annotations
  }

  async function getTransformed(type: 'html' | 'css') {
    const isHTML = type === 'html'
    const id = isHTML ? 'input.html' : 'input.css'
    const input = new MagicString(isHTML ? inputHTML.value : customCSS.value)
    const anns: HighlightAnnotation[] = []
    anns.push(...await applyTransformers(input, id, 'pre'))
    anns.push(...await applyTransformers(input, id))
    anns.push(...await applyTransformers(input, id, 'post'))
    return { output: isHTML ? input.toString() : cleanOutput(input.toString()), annotations: anns }
  }

  // --- Generation ---
  async function generate() {
    output.value = await (await __uno).generate(transformedHTML.value || '')
    annotations.value = transformed.value?.annotations || []
    init.value = true
  }

  async function reGenerate() {
    const uno = await __uno
    await uno.setConfig(customConfig, {})
    await detectTransformer()
    generate()
    const mod = options.moduleMap?.get('@unocss/autocomplete')
    if (mod) {
      autocomplete = Promise.resolve((await mod() as any).createAutocomplete(uno))
    }
    else {
      const { createAutocomplete } = await import('@unocss/autocomplete')
      autocomplete = Promise.resolve(createAutocomplete(uno))
    }
  }

  async function detectTransformer() {
    const uno = await __uno
    const { transformers = [] } = uno.config
    if (!transformers.some((t: any) => t.name === '@unocss/transformer-directives')) {
      const msg = 'Using directives requires \'@unocss/transformer-directives\' to be installed.'
      customCSSWarn.value = new Error(msg)
      transformedCSS.value = customCSS.value
    }
    else {
      const result = await getTransformed('css')
      transformedCSS.value = result.output
    }
  }

  // --- Reactive transformer computation ---
  let initial = true

  // Compute transformed HTML asynchronously
  watch(
    inputHTML,
    async () => {
      const result = await getTransformed('html')
      transformed.value = result
      transformedHTML.value = result.output
    },
    { immediate: true },
  )

  // Compute transformed CSS asynchronously
  watch(
    customCSS,
    async () => {
      const result = await getTransformed('css')
      transformedCSS.value = result.output
    },
    { immediate: true },
  )

  // Watch transformedHTML for generation
  watch(
    transformedHTML,
    generate,
    { immediate: true },
  )

  // --- Config & CSS watch (debounced) ---
  watchDebounced(
    [customConfigRaw, customCSS],
    async () => {
      const uno = await __uno
      customConfigError.value = undefined
      customCSSWarn.value = undefined
      try {
        const result = await _evaluateConfig(customConfigRaw.value)
        if (result) {
          const preflights = (result.preflights ?? []).filter((p: any) => p.layer !== customCSSLayerName)
          preflights.push({
            layer: customCSSLayerName,
            getCSS: () => cleanOutput(transformedCSS.value || ''),
          })
          // @ts-expect-error ignore
          if (!result.presets?.some(preset => preset.name === '@unocss/preset-wind4')) {
            if (resetCSS) {
              preflights.push({
                layer: 'base',
                getCSS: () => resetCSS,
              })
            }
          }

          result.preflights = preflights
          customConfig = result
          await reGenerate()

          if (initial) {
            const { transformers = [] } = uno.config
            if (transformers.length) {
              const htmlResult = await getTransformed('html')
              transformed.value = htmlResult
              transformedHTML.value = htmlResult.output
            }
            initial = false
          }
        }
      }
      catch (e) {
        console.error(e)
        customConfigError.value = e as Error
      }
    },
    { debounce: 300, immediate: true },
  )

  // --- Build the store ---
  const store: ReplStore = {
    inputHTML,
    customConfigRaw,
    customCSS,
    options: optionsRef,
    output,
    annotations,
    transformedHTML,
    transformedCSS,
    customConfigError,
    customCSSWarn,
    init,
    getUno,
    getAutocomplete,
  }

  provide(STORE_KEY, store)

  return store
}

/** Inject the store — used by child components */
export function useStoreContext(): ReplStore {
  const store = inject(STORE_KEY)
  if (!store)
    throw new Error('useStoreContext() called without a parent useStore(). Ensure Repl.vue is mounted.')
  return store
}
