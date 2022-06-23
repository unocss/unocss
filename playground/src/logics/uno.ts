/// <reference types="codemirror/addon/hint/show-hint" />
import type { GenerateResult, UserConfig } from 'unocss'
import { createGenerator } from 'unocss'
import type { Editor, Hints } from 'codemirror'
import { createAutocomplete } from '@unocss/autocomplete'
import MagicString from 'magic-string'
import type { UnocssPluginContext } from '@unocss/core'
import { evaluateUserConfig } from '@unocss/shared-docs'
import { customConfigRaw, inputHTML } from './url'
import { defaultConfig } from './config'

export { customConfigRaw, inputHTML } from './url'

export const init = ref(false)
export const customConfigError = ref<Error>()

export const uno = createGenerator({}, defaultConfig.value)
export const output = shallowRef<GenerateResult>()

let customConfig: UserConfig = {}
let autocomplete = createAutocomplete(uno)

export const transformedHTML = computedAsync(async () => {
  const id = 'input.html'
  const input = new MagicString(inputHTML.value)
  await applyTransformers(input, id, 'pre')
  await applyTransformers(input, id)
  await applyTransformers(input, id, 'post')
  return input.toString()
})

export async function applyTransformers(code: MagicString, id: string, enforce?: 'pre' | 'post') {
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

export async function generate() {
  output.value = await uno.generate(transformedHTML.value || '')
  init.value = true
}

export async function getHint(cm: Editor): Promise<Hints | undefined> {
  const cursor = cm.indexFromPos(cm.getCursor())

  const result = await autocomplete.suggestInFile(cm.getDoc().getValue(), cursor)

  if (!result.suggestions?.length)
    return

  return {
    from: cm.posFromIndex(cursor),
    to: cm.posFromIndex(cursor),
    list: result.suggestions.map(([value, label]) => {
      const resolved = result.resolveReplacement(value)
      return ({
        text: resolved.replacement,
        displayText: label,
        from: cm.posFromIndex(resolved.start),
        to: cm.posFromIndex(resolved.end),
      })
    }),
  }
}

debouncedWatch(
  customConfigRaw,
  async () => {
    customConfigError.value = undefined
    try {
      const result = await evaluateUserConfig(customConfigRaw.value)
      if (result) {
        customConfig = result
        uno.setConfig(customConfig, defaultConfig.value)
        generate()
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

watch(defaultConfig, () => {
  uno.setConfig(customConfig, defaultConfig.value)
  generate()
  autocomplete = createAutocomplete(uno)
})
