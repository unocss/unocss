import type { GenerateResult, UserConfig } from 'unocss'
import { createGenerator } from 'unocss'
import { createAutocomplete } from '@unocss/autocomplete'
import MagicString from 'magic-string'
import type { Annotation, UnocssPluginContext } from '@unocss/core'
import { evaluateUserConfig } from '@unocss/shared-docs'
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'

export const init = ref(false)
export const customConfigError = ref<Error>()

export const uno = createGenerator({}, defaultConfig.value)
export const output = shallowRef<GenerateResult>()
export const annotations = shallowRef<Annotation[]>()

let customConfig: UserConfig = {}
let autocomplete = createAutocomplete(uno)
let initial = true

const { transformedHTML, transformed, getTransformed } = useTransformer()

export async function generate() {
  output.value = await uno.generate(transformedHTML.value || '')
  annotations.value = transformed.value?.annotations || []
  init.value = true
}

function reGenerate() {
  uno.setConfig(customConfig, defaultConfig.value)
  generate()
  autocomplete = createAutocomplete(uno)
}

export async function getHint(context: CompletionContext): Promise<CompletionResult | null> {
  const cursor = context.pos
  const result = await autocomplete.suggestInFile(context.state.doc.toString(), cursor)

  if (!result.suggestions?.length)
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
    customConfigError.value = undefined
    try {
      const result = await evaluateUserConfig(customConfigRaw.value)
      if (result) {
        const preflights = (result.preflights ?? []).filter(p => p.layer !== customCSSLayerName)
        preflights.push({
          layer: customCSSLayerName,
          getCSS: () => customCSS.value,
        })

        result.preflights = preflights
        customConfig = result
        reGenerate()
        if (initial) {
          const { transformers = [] } = uno.config
          if (transformers.length)
            transformed.value = await getTransformed()
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
  transformed,
  generate,
  { immediate: true },
)

watch(defaultConfig, reGenerate)

function useTransformer() {
  const transformed = computedAsync(async () => await getTransformed())
  const transformedHTML = computed(() => transformed.value?.html)

  async function applyTransformers(code: MagicString, id: string, enforce?: 'pre' | 'post') {
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

  async function getTransformed() {
    const id = 'input.html'
    const input = new MagicString(inputHTML.value)
    const annotations = []
    annotations.push(...await applyTransformers(input, id, 'pre'))
    annotations.push(...await applyTransformers(input, id))
    annotations.push(...await applyTransformers(input, id, 'post'))
    return { html: input.toString(), annotations }
  }

  return { transformedHTML, transformed, getTransformed }
}

export { transformedHTML }
