<script lang='ts' setup>
import type { FlexListOption } from './helper'
import { computed, ref, watch } from 'vue'
import { useClassList } from '../../../composables/classList'
import Select from '../../basic/Select.vue'
import { flexColList, flexRowList, gapList, hasUtilityPrefix, withoutClasses } from './helper'
import WH from './WH.vue'

interface Props {
  direction: 'row' | 'col'
  wrap?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  wrap: false,
})

const { classList } = useClassList()

const activeFlexAlignment = ref<string | null>(null)
const selectedGap = ref('auto')
const selectedGapX = ref('auto')
const selectedGapY = ref('auto')

const flexList = computed(() => {
  return props.direction === 'row' ? flexRowList : flexColList
})

// 是否显示 wrap 相关的输入框（只在 row 方向且 wrap 为 true 时显示）
const showWrapInputs = computed(() => {
  return props.direction === 'row' && props.wrap
})

const computedActiveFlexAlignment = computed(() => {
  const currentClasses = classList.value
  for (const item of flexList.value) {
    const classes = item.class.split(' ')
    if (classes.every(cls => currentClasses.includes(cls))) {
      return item.id
    }
  }
  return null
})

const computedGap = computed(() => {
  const currentClasses = classList.value
  const gapClass = currentClasses.find(cls => cls.startsWith('gap-') && !cls.startsWith('gap-x-') && !cls.startsWith('gap-y-'))
  if (gapClass) {
    return gapClass.replace('gap-', '')
  }
  return 'auto'
})

const computedGapX = computed(() => {
  const currentClasses = classList.value
  const gapXClass = currentClasses.find(cls => cls.startsWith('gap-x-'))
  if (gapXClass) {
    return gapXClass.replace('gap-x-', '')
  }
  return 'auto'
})

const computedGapY = computed(() => {
  const currentClasses = classList.value
  const gapYClass = currentClasses.find(cls => cls.startsWith('gap-y-'))
  if (gapYClass) {
    return gapYClass.replace('gap-y-', '')
  }
  return 'auto'
})

watch(computedActiveFlexAlignment, (val) => {
  activeFlexAlignment.value = val
}, { immediate: true })

watch(computedGap, (val) => {
  selectedGap.value = val
}, { immediate: true })

watch(computedGapX, (val) => {
  selectedGapX.value = val
}, { immediate: true })

watch(computedGapY, (val) => {
  selectedGapY.value = val
}, { immediate: true })

function setFlexAlignment(item: FlexListOption) {
  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('justify-'),
    hasUtilityPrefix('items-'),
  ])

  const newClasses = item.class.split(' ')
  classList.value = [...currentClasses, ...newClasses]
  activeFlexAlignment.value = item.id
}

function setGap(value: string | number) {
  const stringValue = String(value)

  const currentClasses = withoutClasses(classList.value, [
    hasUtilityPrefix('gap-'),
  ])

  classList.value = stringValue === 'auto'
    ? currentClasses
    : [...currentClasses, `gap-${stringValue}`]
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
          v-for="item in flexList" :key="item.label"
          :title="item.label"
          class="group relative flex justify-center items-center cursor-pointer"
          @click="setFlexAlignment(item)"
        >
          <div
            :class="[item.icon, activeFlexAlignment === item.id ? 'text-yellow-500 op-100!' : '']"
            class="op-0 transition-opacity group-hover:op-100"
          />
          <div
            :class="activeFlexAlignment === item.id ? 'op-0!' : ''"
            class="bg-white/50 size-1.3 rd-full op-100 transition-opacity group-hover:op-0 pos-center"
          />
        </div>
      </div>
      <div flex="1 ~ col gap-2">
        <template v-if="!showWrapInputs">
          <Select v-model="selectedGap" placeholder="Gap" :options="gapList" inputable @update:model-value="setGap">
            <template #prefix>
              <div i-hugeicons:paragraph-spacing rotate-90 />
            </template>
          </Select>
        </template>

        <template v-else>
          <!-- Gap X -->
          <Select v-model="selectedGapX" placeholder="Gap X" :options="gapList" inputable @update:model-value="setGapX">
            <template #prefix>
              <div i-hugeicons:paragraph-spacing rotate-90 />
            </template>
          </Select>
          <!-- Gap Y -->
          <Select v-model="selectedGapY" placeholder="Gap Y" :options="gapList" inputable @update:model-value="setGapY">
            <template #prefix>
              <div i-hugeicons:paragraph-spacing />
            </template>
          </Select>
        </template>
      </div>
    </div>
  </div>
</template>
