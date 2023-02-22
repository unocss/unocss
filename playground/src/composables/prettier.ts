import { useCSSPrettify, useHTMLPrettify, useJSPrettify } from '../../../packages/inspector/client/composables/usePrettify'

export function formatHTML() {
  inputHTML.value = useHTMLPrettify(options.value.transform ? transformedHTML : inputHTML).value
}

export function formatConfig() {
  customConfigRaw.value = useJSPrettify(customConfigRaw).value
}

export const showPreflights = ref(false)
export const isCSSPrettify = ref(false)
export const cssFormatted = useCSSPrettify(
  computed(() => output.value?.getLayers(undefined,
    showPreflights.value
      ? undefined
      : ['preflights'],
  )),
  isCSSPrettify,
)
