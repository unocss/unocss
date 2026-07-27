import { prettify, useCSSPrettify } from '../../../packages-integrations/inspector/client/composables/usePrettify'

export async function formatHTML() {
  inputHTML.value = await prettify(toValue(options.value.transformHtml ? transformedHTML : inputHTML), 'html')
}

export async function formatConfig() {
  customConfigRaw.value = await prettify(customConfigRaw.value, 'babel')
}

export async function formatCSS() {
  customCSS.value = await prettify(toValue(options.value.transformCustomCSS ? transformedCSS : customCSS), 'css')
}

export const isCSSPrettify = ref(false)
export const selectedLayers = ref<string[]>(['ALL'])
export const cssFormatted = useCSSPrettify(
  computed(() => selectedLayers.value.includes('ALL') ? output.value?.css : output.value?.getLayers(selectedLayers.value)),
  isCSSPrettify,
)
