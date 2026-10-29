import type { InjectionKey, Ref } from 'vue'
import { inject, onScopeDispose, provide, ref, shallowRef, watch } from 'vue'

export interface ElementContext {
  element: Ref<HTMLElement | null>
  tracking: () => void
  triggering: () => void
}

const elementKey: InjectionKey<ElementContext> = Symbol('unocss-inspector-element')

export function useTracker(): ElementContext {
  const element = shallowRef<HTMLElement | null>(null)
  const revision = ref(0)
  let timer: ReturnType<typeof setTimeout> | undefined
  const context: ElementContext = {
    element,
    tracking: () => { void revision.value },
    triggering() {
      revision.value++
      clearTimeout(timer)
      timer = setTimeout(() => revision.value++, 300)
    },
  }
  watch(element, (selected, _old, cleanup) => {
    if (!selected)
      return
    const mutation = new MutationObserver(context.triggering)
    const resize = new ResizeObserver(context.triggering)
    mutation.observe(selected, { attributes: true, childList: true, characterData: true, subtree: true })
    resize.observe(selected)
    cleanup(() => {
      mutation.disconnect()
      resize.disconnect()
    })
  })
  onScopeDispose(() => clearTimeout(timer))
  provide(elementKey, context)
  return context
}

export function useElement() {
  const context = inject(elementKey)
  if (!context)
    throw new Error('useElement must be used within the UnoCSS Inspector')
  return {
    ...context,
    setElementStyle(styles: Partial<CSSStyleDeclaration>) {
      if (context.element.value) {
        Object.assign(context.element.value.style, styles)
        context.triggering()
      }
    },
  }
}
