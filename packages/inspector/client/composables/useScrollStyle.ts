import type { MaybeElementRef } from '@vueuse/core'
import { unrefElement, useResizeObserver } from '@vueuse/core'

export function useScrollStyle(target: MaybeElementRef, cssVarName: string) {
  const scrollStyle = ref<string | null>(null)
  useResizeObserver(target, () => {
    const clientHeight = unrefElement(target)?.clientHeight
    scrollStyle.value = clientHeight ? `--${cssVarName}: calc(100vh - ${clientHeight}px - 2px);` : null
  })
  return scrollStyle
}
