import type { GenerateResult, UserConfig } from 'unocss'
import { createGenerator } from 'unocss'
import { createAutocomplete } from '@unocss/autocomplete'
import MagicString from 'magic-string'
import type { UnocssPluginContext } from '@unocss/core'
import { evaluateUserConfig } from '@unocss/shared-docs'
import type { CompletionContext, CompletionResult } from '@codemirror/autocomplete'

export const init = ref(false)
export const customConfigError = ref<Error>()

export const uno = createGenerator({}, defaultConfig.value)
export const output = shallowRef<GenerateResult>()

let customConfig: UserConfig = {}
let autocomplete = createAutocomplete(uno)
let initial = true

const { transformedHTML, getTransformedHTML } = useTransformer()

export async function generate() {
  output.value = await uno.generate(transformedHTML.value || '')
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
    options: result.suggestions.map(([, label]) => {
      return ({
        label,
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
            transformedHTML.value = await getTransformedHTML()
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

watch(defaultConfig, reGenerate)

function useTransformer() {
  const transformedHTML = computedAsync(async () => await getTransformedHTML())

  async function applyTransformers(code: MagicString, id: string, enforce?: 'pre' | 'post') {
    let { transformers } = uno.config
    transformers = (transformers ?? []).filter(i => i.enforce === enforce)

    if (!transformers.length)
      return

    const fakePluginContext = { uno } as UnocssPluginContext
    for (const { idFilter, transform } of transformers) {
      if (idFilter && !idFilter(id))
        continue
      await transform(code, id, fakePluginContext)
    }
  }

  async function getTransformedHTML() {
    const id = 'input.html'
    const input = new MagicString(inputHTML.value)
    await applyTransformers(input, id, 'pre')
    await applyTransformers(input, id)
    await applyTransformers(input, id, 'post')
    return input.toString()
  }

  return { transformedHTML, getTransformedHTML }
}

export { transformedHTML }
