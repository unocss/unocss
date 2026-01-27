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

export const isCSSPrettify = ref(false)
export const selectedLayers = ref<string[]>(['ALL'])
export const cssFormatted = useCSSPrettify(
  computedAsync(async () => {
    if (selectedLayers.value.includes('ALL'))
      return output.value?.css ?? ''
    return output.value ? await output.value.getLayers(selectedLayers.value) : ''
  }),
  isCSSPrettify,
)
