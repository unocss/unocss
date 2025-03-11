import { useCSSPrettify, useHTMLPrettify, useJSPrettify } from '../../../packages-integrations/inspector/client/composables/usePrettify'

export function formatHTML() {
  inputHTML.value = useHTMLPrettify(options.value.transformHtml ? transformedHTML : inputHTML).value
}

export function formatConfig() {
  customConfigRaw.value = useJSPrettify(customConfigRaw).value
}

export function formatCSS() {
  customCSS.value = useCSSPrettify(options.value.transformCustomCSS ? transformedCSS : customCSS).value
}

export const showPreflights = ref(false)
export const isCSSPrettify = ref(false)
export const selectedLayers = ref<(string | undefined)[]>(['default'])
export const cssFormatted = useCSSPrettify(
  computed(() => output.value?.getLayers(selectedLayers.value.filter(Boolean) as string[])),
  isCSSPrettify,
)
