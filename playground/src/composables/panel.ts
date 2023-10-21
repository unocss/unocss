export const panelEl = ref()
const TITLE_HEIGHT = 29
const { height: vh } = useElementSize(panelEl)
const collapsedPanels = ref(new Set())

export const titleHeightPercent = computed(() => {
  if (!vh.value)
    return 0
  return TITLE_HEIGHT / vh.value * 100
})

export const panelSizes = useLocalStorage<number[]>(
  'unocss-panel-sizes',
  getInitialPanelSizes(titleHeightPercent.value),
  { listenToStorageChanges: false },
)

export function getInitialPanelSizes(percent: number): number[] {
  return [
    100 - percent * 3,
    percent,
    percent,
    percent,
  ]
}

export function isCollapsed(idx: number) {
  return collapsedPanels.value.has(idx)
}

export function togglePanel(idx: number) {
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

export function normalizePanels() {
  const height = (100 - collapsedPanels.value.size * titleHeightPercent.value) / (panelSizes.value.length - collapsedPanels.value.size)
  panelSizes.value = panelSizes.value.map((_, idx) => collapsedPanels.value.has(idx) ? titleHeightPercent.value : height)
}

watch(
  panelSizes,
  (value: number[]) => {
    value.forEach((height, idx) => {
      if (height > titleHeightPercent.value)
        collapsedPanels.value.delete(idx)
      else
        collapsedPanels.value.add(idx)
    })
  },
)

watch(
  titleHeightPercent,
  (value: number) => {
    const spareSpace = (100 - collapsedPanels.value.size * value - panelSizes.value.reduce((uncollapsed, height, idx) => collapsedPanels.value.has(idx) ? uncollapsed : uncollapsed + height, 0)) / (panelSizes.value.length - collapsedPanels.value.size)
    panelSizes.value = panelSizes.value.map((height, idx) => (height <= value || collapsedPanels.value.has(idx)) ? value : height + spareSpace)
  },
)
