import { useEventListener, useWindowSize } from '@vueuse/core'
import { onScopeDispose, ref } from 'vue'
import { useTracker } from './exports/element'
import { useLiveStyles } from './live-styles'
import { useMagicKey } from './magickey'

export function useSelection() {
  const context = useTracker()
  const { element, tracking, triggering } = context
  useLiveStyles(context)
  const isSelecting = ref(false)
  const isDraggingControl = ref(false)
  const controlPosition = ref({ x: 20, y: 20 })
  const { width, height } = useWindowSize()
  let previousCursor: string | undefined
  let drag: { x: number, y: number, left: number, top: number } | undefined
  let selectionTimer: ReturnType<typeof setTimeout> | undefined

  function endSelection() {
    isSelecting.value = false
    if (previousCursor !== undefined) {
      document.body.style.cursor = previousCursor
      previousCursor = undefined
    }
  }

  function startSelecting() {
    if (previousCursor === undefined)
      previousCursor = document.body.style.cursor
    isSelecting.value = true
    document.body.style.cursor = 'crosshair'
  }

  function stopSelecting() {
    endSelection()
    element.value = null
  }

  function getTarget(event: MouseEvent) {
    // Shadow DOM retargets internal events to the host. Leave these events
    // alone so inspector controls remain usable while picking an element.
    const path = event.composedPath()
    if (path.some(node => node instanceof Element && node.id === 'unocss-inspector-root'))
      return
    const target = path[0]
    return target instanceof HTMLElement ? target : undefined
  }

  useEventListener(document, 'mouseover', (event) => {
    if (isSelecting.value) {
      const target = getTarget(event)
      if (target)
        element.value = target
    }
  }, { capture: true })

  useEventListener(document, 'click', (event) => {
    if (!isSelecting.value)
      return
    const target = getTarget(event)
    if (!target)
      return
    event.preventDefault()
    event.stopImmediatePropagation()
    element.value = target
    endSelection()
  }, { capture: true })

  function startControlDrag(event: MouseEvent) {
    if (event.button !== 0)
      return
    drag = { x: event.clientX, y: event.clientY, left: controlPosition.value.x, top: controlPosition.value.y }
    event.preventDefault()
    event.stopPropagation()
  }

  useEventListener(document, 'mousemove', (event) => {
    if (!drag)
      return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (Math.hypot(dx, dy) > 5)
      isDraggingControl.value = true
    if (isDraggingControl.value) {
      controlPosition.value = {
        x: Math.max(0, Math.min(drag.left + dx, width.value - 40)),
        y: Math.max(0, Math.min(drag.top + dy, height.value - 40)),
      }
    }
  })

  useEventListener(document, 'mouseup', () => {
    if (!drag)
      return
    if (!isDraggingControl.value) {
      clearTimeout(selectionTimer)
      selectionTimer = setTimeout(startSelecting, 0)
    }
    drag = undefined
    isDraggingControl.value = false
  })

  useEventListener(window, 'resize', triggering)
  useEventListener(window, 'scroll', triggering, { capture: true })
  useMagicKey(() => isSelecting.value ? stopSelecting() : startSelecting(), stopSelecting)
  onScopeDispose(() => {
    clearTimeout(selectionTimer)
    endSelection()
  })

  return { selectedElement: element, tracking, isSelecting, isDraggingControl, controlPosition, startSelecting, stopSelecting, startControlDrag }
}
