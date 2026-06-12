import type { InjectionKey, Ref } from 'vue'
import { computed, inject, provide, ref } from 'vue'
import { useStoreContext } from '../store'
import { useCSSPrettify } from './usePrettify'

export interface CssOutputContext {
  selectedLayers: Ref<string[]>
  cssFormatted: Ref<string | undefined>
  isCSSPrettify: Ref<boolean>
}

const CSS_OUTPUT_KEY: InjectionKey<CssOutputContext> = Symbol('css-output')

export function useCssOutput(): CssOutputContext {
  const store = useStoreContext()

  const isCSSPrettify = ref(false)
  const selectedLayers = ref<string[]>(['ALL'])
  const cssFormatted = useCSSPrettify(
    computed(() => selectedLayers.value.includes('ALL')
      ? store.output.value?.css
      : store.output.value?.getLayers(selectedLayers.value)),
    isCSSPrettify,
  )

  const context: CssOutputContext = {
    selectedLayers,
    cssFormatted,
    isCSSPrettify,
  }

  provide(CSS_OUTPUT_KEY, context)

  return context
}

/** Inject the CSS output context — used by child components like SelectLayers */
export function useCssOutputContext(): CssOutputContext {
  const ctx = inject(CSS_OUTPUT_KEY)
  if (!ctx)
    throw new Error('useCssOutputContext() called without a parent useCssOutput(). Ensure PanelOutputCss.vue is mounted.')
  return ctx
}
