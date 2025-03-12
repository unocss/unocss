import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'
import type { HighlightAnnotation, UnocssPluginContext } from '@unocss/core'
import type { GenerateResult, UserConfig } from 'unocss'
import { evaluateUserConfig } from '#docs'
import { unocssBundle } from '#docs/unocss-bundle'
import { createAutocomplete } from '@unocss/autocomplete'
import MagicString from 'magic-string'
import { createGenerator } from 'unocss'

export const init = ref(false)
export const customConfigError = ref<Error>()
export const customCSSWarn = ref<Error>()

const __uno = createGenerator({}, defaultConfig.value)
export const output = shallowRef<GenerateResult>()
export const annotations = shallowRef<HighlightAnnotation[]>()

let customConfig: UserConfig = {}
let autocomplete = (async () => createAutocomplete(await __uno))()
let initial = true

const { transformedHTML, transformed, getTransformed, transformedCSS } = useTransformer()

export async function generate() {
  output.value = await (await __uno).generate(transformedHTML.value || '')
  annotations.value = transformed.value?.annotations || []
  init.value = true
}

async function reGenerate() {
  const uno = await __uno
  await uno.setConfig(customConfig, defaultConfig.value)
  await detectTransformer()
  generate()
  autocomplete = Promise.resolve(createAutocomplete(uno))
}

export async function getHint(context: CompletionContext): Promise<CompletionResult | null> {
  const cursor = context.pos
  const result = await (await autocomplete).suggestInFile(context.state.doc.toString(), cursor)

  if (!result?.suggestions?.length)
    return null

  const resolved = result.resolveReplacement(result.suggestions[0][0])
  return {
    from: resolved.start,
    options: result.suggestions.map(([value, label]) => {
      return ({
        label,
        apply: value,
        type: 'text',
        boost: 99,
      })
    }),
  }
}

debouncedWatch(
  [customConfigRaw, customCSS],
  async () => {
    const uno = await __uno
    customConfigError.value = undefined
    customCSSWarn.value = undefined
    try {
      const result = await evaluateUserConfig(customConfigRaw.value, unocssBundle)
      if (result) {
        const preflights = (result.preflights ?? []).filter(p => p.layer !== customCSSLayerName)
        preflights.push({
          layer: customCSSLayerName,
          getCSS: () => cleanOutput(transformedCSS.value || ''),
        })

        result.preflights = preflights
        customConfig = result
        await reGenerate()

        if (initial) {
          const { transformers = [] } = uno.config
          if (transformers.length)
            transformed.value = await getTransformed('html')
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

watch(
  transformedHTML,
  generate,
  { immediate: true },
)

function useTransformer() {
  const transformed = computedAsync(async () => await getTransformed('html'))
  const transformedHTML = computed(() => transformed.value?.output || '')
  const transformedCSS = computedAsync(async () => (await getTransformed('css')).output)

  async function applyTransformers(code: MagicString, id: string, enforce?: 'pre' | 'post') {
    const uno = await __uno
    let { transformers } = uno.config
    transformers = (transformers ?? []).filter(i => i.enforce === enforce)

    if (!transformers.length)
      return []

    const annotations = []
    const fakePluginContext = { uno } as UnocssPluginContext
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
    const annotations = []
    annotations.push(...await applyTransformers(input, id, 'pre'))
    annotations.push(...await applyTransformers(input, id))
    annotations.push(...await applyTransformers(input, id, 'post'))
    return { output: isHTML ? input.toString() : cleanOutput(input.toString()), annotations }
  }

  return { transformedHTML, transformed, getTransformed, transformedCSS }
}

async function detectTransformer() {
  const uno = await __uno
  const { transformers = [] } = uno.config
  if (!transformers.some(t => t.name === '@unocss/transformer-directives')) {
    const msg = 'Using directives requires \'@unocss/transformer-directives\' to be installed.'
    customCSSWarn.value = new Error(msg)
    transformedCSS.value = customCSS.value
  }
  else {
    transformedCSS.value = (await getTransformed('css')).output
  }
}

export { transformedCSS, transformedHTML }

function cleanOutput(code: string) {
  return code.replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\n\s+/g, '\n')
    .trim()
}
