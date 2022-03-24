/// <reference types="codemirror/addon/hint/show-hint" />
import type { GenerateResult, UserConfig } from 'unocss'
import { createGenerator } from 'unocss'
import * as __unocss from 'unocss'
import type { Editor, Hints } from 'codemirror'
import { createAutocomplete } from '@unocss/autocomplete'
import MagicString from 'magic-string'
import type { UnocssPluginContext } from '@unocss/core'
import { customConfigRaw, inputHTML } from './url'
import { defaultConfig } from './config'

export { customConfigRaw, inputHTML } from './url'

const modules: any = {
  unocss: __unocss,
}

export const init = ref(false)
export const customConfigError = ref<Error>()

export const uno = createGenerator({}, defaultConfig.value)
export const options = useStorage('unocss-options', {})
export const output = shallowRef<GenerateResult>()

let customConfig: UserConfig = {}
let autocomplete = createAutocomplete(uno)

const AsyncFunction = Object.getPrototypeOf(async() => {}).constructor

export async function evaluateConfig() {
  customConfigError.value = undefined
  const code = customConfigRaw.value
    .replace(/import\s*(.*?)\s*from\s*(['"])unocss\2/g, 'const $1 = await __require("unocss");')
    .replace(/import\s*(\{.*?\})\s*from\s*(['"])([\w-@/]+)\2/g, 'const $1 = await import("https://cdn.skypack.dev/$3");')
    .replace(/import\s*(.*?)\s*from\s*(['"])([\w-@/]+)\2/g, 'const $1 = (await import("https://cdn.skypack.dev/$3")).default;')
    .replace(/export default /, 'return ')

  const __require = (name: string): any => {
    return modules[name]
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new AsyncFunction('__require', code)

    const result = await fn(__require)

    if (result) {
      customConfig = result
      uno.setConfig(customConfig, defaultConfig.value)
      generate()
    }
  }
  catch (e: any) {
    customConfigError.value = e
  }
}

export const transformedHTML = computedAsync(async() => {
  const id = 'input.html'
  const input = new MagicString(inputHTML.value)
  applyTransformers(input, id, 'pre')
  applyTransformers(input, id)
  applyTransformers(input, id, 'post')
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
  evaluateConfig,
  { debounce: 300, immediate: true },
)

watch(
  inputHTML,
  generate,
  { immediate: true },
)

watch(defaultConfig, () => {
  uno.setConfig(customConfig, defaultConfig.value)
  generate()
  autocomplete = createAutocomplete(uno)
})
