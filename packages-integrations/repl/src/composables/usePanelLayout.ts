import type { InjectionKey, Ref } from 'vue'
import { useElementSize, useLocalStorage } from '@vueuse/core'
import { computed, inject, provide, ref, watch } from 'vue'

export interface PanelLayoutContext {
  panelEl: Ref<any>
  panelSizes: Ref<number[]>
  collapsedPanels: Ref<Set<number>>
  titleHeightPercent: Ref<number>
  normalizePanels: (nextSizes?: number[]) => void
  togglePanel: (idx: number) => void
  isCollapsed: (idx: number) => boolean
}

const PANEL_LAYOUT_KEY: InjectionKey<PanelLayoutContext> = Symbol('panel-layout')
const PANEL_COUNT = 4
const TITLE_HEIGHT = 30
const DEFAULT_PANEL_SIZES = [55, 15, 15, 15]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function usePanelLayout(): PanelLayoutContext {
  const panelEl = ref<HTMLElement>()
  const { height: vh } = useElementSize(panelEl)

  const titleHeightPercent = computed(() => {
    if (!vh.value)
      return 0
    return Math.min(100 / PANEL_COUNT, TITLE_HEIGHT / vh.value * 100)
  })

  const collapsedPanels = ref(new Set<number>())

  const panelSizes = useLocalStorage<number[]>(
    'unocss-panel-sizes',
    DEFAULT_PANEL_SIZES,
    { listenToStorageChanges: false },
  )

  function isCollapsed(idx: number) {
    return collapsedPanels.value.has(idx)
  }

  function normalizePanels(nextSizes = panelSizes.value) {
    const minSize = titleHeightPercent.value
    const count = Math.max(PANEL_COUNT, nextSizes.length)
    const collapsed = new Set(
      Array.from(collapsedPanels.value)
        .filter(idx => idx >= 0 && idx < count),
    )

    if (collapsed.size >= count)
      collapsed.delete(0)

    const openIndexes = Array.from({ length: count }, (_, idx) => idx)
      .filter(idx => !collapsed.has(idx))
    const collapsedTotal = collapsed.size * minSize
    const openTotal = Math.max(0, 100 - collapsedTotal)
    const minOpenTotal = openIndexes.length * minSize
    const sourceOpenSizes = openIndexes.map(idx => clamp(nextSizes[idx] ?? DEFAULT_PANEL_SIZES[idx] ?? minSize, minSize, 100))

    let normalizedOpenSizes: number[]
    if (openTotal <= minOpenTotal) {
      const equalSize = openIndexes.length ? openTotal / openIndexes.length : 0
      normalizedOpenSizes = openIndexes.map(() => equalSize)
    }
    else {
      const sourceTotal = sourceOpenSizes.reduce((sum, size) => sum + size, 0) || openIndexes.length
      normalizedOpenSizes = sourceOpenSizes.map(size => size / sourceTotal * openTotal)

      let deficit = 0
      normalizedOpenSizes = normalizedOpenSizes.map((size) => {
        if (size >= minSize)
          return size
        deficit += minSize - size
        return minSize
      })

      if (deficit > 0) {
        const adjustable = normalizedOpenSizes
          .map((size, idx) => ({ idx, extra: Math.max(0, size - minSize) }))
          .filter(item => item.extra > 0)
        const adjustableTotal = adjustable.reduce((sum, item) => sum + item.extra, 0)
        for (const item of adjustable)
          normalizedOpenSizes[item.idx] -= deficit * (item.extra / adjustableTotal)
      }
    }

    const next = Array.from({ length: count }, (_, idx) => collapsed.has(idx) ? minSize : 0)
    openIndexes.forEach((idx, openIdx) => {
      next[idx] = normalizedOpenSizes[openIdx] ?? minSize
    })

    const total = next.reduce((sum, size) => sum + size, 0)
    if (total > 0)
      panelSizes.value = next.map(size => size / total * 100)
    else
      panelSizes.value = DEFAULT_PANEL_SIZES

    collapsedPanels.value = collapsed
  }

  function togglePanel(idx: number) {
    if (collapsedPanels.value.has(idx)) {
      collapsedPanels.value.delete(idx)
    }
    else {
      collapsedPanels.value.add(idx)
      if (collapsedPanels.value.size === panelSizes.value.length)
        collapsedPanels.value.delete((idx + 1) % panelSizes.value.length)
    }

    normalizePanels()
  }

  function syncCollapsedFromSizes(value: number[]) {
    const minSize = titleHeightPercent.value
    if (!minSize)
      return

    const nextCollapsed = new Set<number>()
    value.forEach((height, idx) => {
      if (height <= minSize + 0.1)
        nextCollapsed.add(idx)
    })
    if (nextCollapsed.size < value.length)
      collapsedPanels.value = nextCollapsed
  }

  watch(
    panelSizes,
    (value: number[]) => {
      syncCollapsedFromSizes(value)
    },
    { deep: true },
  )

  watch(
    titleHeightPercent,
    (value: number) => {
      if (value)
        normalizePanels()
    },
    { immediate: true },
  )

  const context: PanelLayoutContext = {
    panelEl,
    panelSizes,
    collapsedPanels,
    titleHeightPercent,
    normalizePanels,
    togglePanel,
    isCollapsed,
  }

  provide(PANEL_LAYOUT_KEY, context)

  return context
}

/** Inject the panel layout context — used by child panel components */
export function usePanelLayoutContext(): PanelLayoutContext {
  const ctx = inject(PANEL_LAYOUT_KEY)
  if (!ctx)
    throw new Error('usePanelLayoutContext() called without a parent usePanelLayout(). Ensure ReplEditor.vue is mounted.')
  return ctx
}
