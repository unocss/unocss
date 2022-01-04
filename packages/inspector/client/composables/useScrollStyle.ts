import type { MaybeElementRef } from '@vueuse/core'
import { unrefElement, useResizeObserver } from '@vueuse/core'

export const useScrollStyle = (target: MaybeElementRef, cssVarName: string) => {
  const scrollStyle = ref<string | null>(null)
  useResizeObserver(target, () => {
    scrollStyle.value = `--${cssVarName}: calc(100vh - ${(target && unrefElement(target)?.clientHeight) ?? 0}px - 2px);`
  })
  return scrollStyle
}
