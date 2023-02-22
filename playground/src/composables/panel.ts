export const panelEl = ref()
const TITLE_HEIGHT = 30
const { height: vh } = useElementSize(panelEl)

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
    100 - percent * 2,
    percent,
    percent,
  ]
}

export function isCollapsed(index: number) {
  return panelSizes.value[index] <= titleHeightPercent.value + 3
}

export function togglePanel(index: number) {
  if (isCollapsed(index))
    panelSizes.value[index] = 100 / panelSizes.value.length
  else
    panelSizes.value[index] = titleHeightPercent.value

  normalizePanels()
}

export function normalizePanels() {
  const ignoredIndex: number[] = []
  let originalSum = 0
  let ignoredSum = 0

  panelSizes.value.forEach((v, idx) => {
    if (v <= titleHeightPercent.value) {
      ignoredIndex.push(idx)
      ignoredSum += v
    }
    else {
      originalSum += v
    }
  })

  const resize = (100 - ignoredSum) / originalSum

  panelSizes.value.forEach((v, idx) => {
    if (ignoredIndex.includes(idx))
      return
    panelSizes.value[idx] *= resize
  })
}

watch(
  titleHeightPercent,
  (value: number) => {
    panelSizes.value = getInitialPanelSizes(value)
  },
)
