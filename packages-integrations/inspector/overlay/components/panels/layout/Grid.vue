<script lang='ts' setup>
import type { FlexListOption } from './helper'
import { computed, ref, watch } from 'vue'
import { useClassList } from '../../../composables/classList'
import Select from '../../basic/Select.vue'
import { gapList, gridAlignmentList, gridTrackList, hasUtilityPrefix, withoutClasses } from './helper'
import WH from './WH.vue'

const { classList } = useClassList()

const selectedCols = ref('auto')
const selectedRows = ref('auto')
const selectedGapX = ref('auto')
const selectedGapY = ref('auto')
const activeGridAlignment = ref<string | null>(null)

const computedCols = computed(() => {
  const gridColsClass = classList.value.find(cls => cls.startsWith('grid-cols-'))
  return gridColsClass?.replace('grid-cols-', '') || 'auto'
})

const computedRows = computed(() => {
  const gridRowsClass = classList.value.find(cls => cls.startsWith('grid-rows-'))
  return gridRowsClass?.replace('grid-rows-', '') || 'auto'
})

const computedGapX = computed(() => {
  const gapXClass = classList.value.find(cls => cls.startsWith('gap-x-'))
  const gapClass = classList.value.find(cls => cls.startsWith('gap-') && !cls.startsWith('gap-x-') && !cls.startsWith('gap-y-'))
  return gapXClass?.replace('gap-x-', '') || gapClass?.replace('gap-', '') || 'auto'
})

const computedGapY = computed(() => {
  const gapYClass = classList.value.find(cls => cls.startsWith('gap-y-'))
  const gapClass = classList.value.find(cls => cls.startsWith('gap-') && !cls.startsWith('gap-x-') && !cls.startsWith('gap-y-'))
  return gapYClass?.replace('gap-y-', '') || gapClass?.replace('gap-', '') || 'auto'
})

const computedActiveGridAlignment = computed(() => {
  const currentClasses = classList.value
  for (const item of gridAlignmentList) {
    const classes = item.class.split(' ')
    if (classes.every(cls => currentClasses.includes(cls)))
      return item.id
  }
  return null
})

watch(computedCols, (val) => {
  selectedCols.value = val
}, { immediate: true })

watch(computedRows, (val) => {
  selectedRows.value = val
}, { immediate: true })

watch(computedGapX, (val) => {
  selectedGapX.value = val
}, { immediate: true })

watch(computedGapY, (val) => {
  selectedGapY.value = val
}, { immediate: true })

watch(computedActiveGridAlignment, (val) => {
  activeGridAlignment.value = val
}, { immediate: true })

function setGridCols(value: string | number) {
  const stringValue = String(value)
  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('grid-cols-'),
  ])

  classList.value = stringValue === 'auto'
    ? currentClasses
    : [...currentClasses, `grid-cols-${stringValue}`]
}

function setGridRows(value: string | number) {
  const stringValue = String(value)
  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('grid-rows-'),
  ])

  classList.value = stringValue === 'auto'
    ? currentClasses
    : [...currentClasses, `grid-rows-${stringValue}`]
}

function setGapX(value: string | number) {
  const stringValue = String(value)
  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('gap-x-'),
    cls => cls.startsWith('gap-') && !cls.startsWith('gap-y-'),
  ])

  classList.value = stringValue === 'auto'
    ? currentClasses
    : [...currentClasses, `gap-x-${stringValue}`]
}

function setGapY(value: string | number) {
  const stringValue = String(value)
  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('gap-y-'),
    cls => cls.startsWith('gap-') && !cls.startsWith('gap-x-'),
  ])

  classList.value = stringValue === 'auto'
    ? currentClasses
    : [...currentClasses, `gap-y-${stringValue}`]
}

function setGridAlignment(item: FlexListOption) {
  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('justify-items-'),
    hasUtilityPrefix('place-items-'),
    hasUtilityPrefix('items-'),
  ])

  classList.value = [
    ...currentClasses,
    ...item.class.split(' '),
  ]
  activeGridAlignment.value = item.id
}
</script>

<template>
  <div class="space-y-2">
    <WH />
    <div flex="~ gap-2">
      <div
        flex-1
        class="b b-solid b-white/10 grid grid-cols-3 grid-gap-0.5 rd-md p-1 text-xs h-17"
      >
        <div
          v-for="item in gridAlignmentList" :key="item.label"
          :title="item.label"
          class="group relative flex justify-center items-center cursor-pointer"
          @click="setGridAlignment(item)"
        >
          <div
            :class="[item.icon, activeGridAlignment === item.id ? 'text-yellow-500 op-100' : '']"
            class="op-0 transition-opacity group-hover:op-100"
          />
          <div
            :class="activeGridAlignment === item.id ? 'op-0!' : ''"
            class="bg-white/50 size-1.3 rd-full op-100 transition-opacity group-hover:op-0 pos-center"
          />
        </div>
      </div>

      <div flex="1 ~ col gap-2">
        <div flex="~ gap-2">
          <Select v-model="selectedCols" placeholder="Cols" :options="gridTrackList" inputable @update:model-value="setGridCols">
            <template #prefix>
              <span op-50>C</span>
            </template>
          </Select>
          <Select v-model="selectedRows" placeholder="Rows" :options="gridTrackList" inputable @update:model-value="setGridRows">
            <template #prefix>
              <span op-50>R</span>
            </template>
          </Select>
        </div>

        <div flex="~ gap-2">
          <Select v-model="selectedGapX" placeholder="Gap X" :options="gapList" inputable @update:model-value="setGapX">
            <template #prefix>
              <div i-hugeicons:paragraph-spacing rotate-90 />
            </template>
          </Select>
          <Select v-model="selectedGapY" placeholder="Gap Y" :options="gapList" inputable @update:model-value="setGapY">
            <template #prefix>
              <div i-hugeicons:paragraph-spacing />
            </template>
          </Select>
        </div>
      </div>
    </div>
  </div>
</template>
