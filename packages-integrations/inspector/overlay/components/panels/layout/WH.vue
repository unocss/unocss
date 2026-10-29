<script lang='ts' setup>
import { computed, ref, watch } from 'vue'
import { useElement } from '../../../composables/exports/element'
import { pxToRem, remToPx, round } from '../../../utils'
import Select from '../../basic/Select.vue'

const { element, tracking, triggering } = useElement()

const isRemUnit = ref(false)
const isRatioLocked = ref(false)
const aspectRatio = ref(1)

function parseValue(value: string | undefined) {
  if (!value)
    return { num: 0, unit: 'px' }
  const match = value.match(/^([\d.]+)(px|rem|%)$/)
  if (match) {
    return { num: Number.parseFloat(match[1]), unit: match[2] }
  }
  return { num: Number.parseFloat(value) || 0, unit: 'px' }
}

function formatValue(num: number, unit: string) {
  if (unit === '%')
    return `${num}%`
  return `${num}${unit}`
}

const w = computed({
  get: () => {
    if (!element.value)
      return ''

    tracking()

    let value = element.value.style.width

    if (!value || value === '') {
      const computedStyle = window.getComputedStyle(element.value)
      value = computedStyle.width
      if (value === 'auto' || Number.parseFloat(value) > 9999) {
        return ''
      }
    }

    if (!value || value === '0px')
      return ''

    if (value === 'auto')
      return 'auto'

    if (value.includes('%'))
      return value

    const { num, unit } = parseValue(value)
    if (isRemUnit.value && unit === 'px') {
      return String(pxToRem(num))
    }
    else if (!isRemUnit.value && unit === 'rem') {
      return String(remToPx(num))
    }
    return round(num)
  },
  set: (value) => {
    if (element.value && value) {
      if (value === 'auto' || String(value).includes('%')) {
        element.value.style.width = String(value)
        triggering()
        return
      }

      const numValue = Number.parseFloat(String(value))
      if (Number.isNaN(numValue))
        return

      const unit = isRemUnit.value ? 'rem' : 'px'
      const finalValue = `${numValue}${unit}`

      const oldHeight = element.value.style.height
      element.value.style.width = finalValue

      if (isRatioLocked.value && finalValue !== 'auto' && oldHeight && oldHeight !== 'auto') {
        const { num } = parseValue(finalValue)
        const newHeight = num / aspectRatio.value
        const { unit: heightUnit } = parseValue(oldHeight)
        element.value.style.height = formatValue(newHeight, heightUnit)
      }

      triggering()
    }
  },
})

const h = computed({
  get: () => {
    if (!element.value)
      return ''

    tracking()

    let value = element.value.style.height

    if (!value || value === '') {
      const computedStyle = window.getComputedStyle(element.value)
      value = computedStyle.height
      if (value === 'auto' || Number.parseFloat(value) > 9999) {
        return ''
      }
    }

    if (!value || value === '0px')
      return ''

    if (value === 'auto')
      return 'auto'

    if (value.includes('%'))
      return value

    const { num, unit } = parseValue(value)
    if (isRemUnit.value && unit === 'px') {
      return String(pxToRem(num))
    }
    else if (!isRemUnit.value && unit === 'rem') {
      return String(remToPx(num))
    }
    return round(num)
  },
  set: (value) => {
    if (element.value && value) {
      if (value === 'auto' || String(value).includes('%')) {
        element.value.style.height = String(value)
        triggering()
        return
      }

      const numValue = Number.parseFloat(String(value))
      if (Number.isNaN(numValue))
        return

      const unit = isRemUnit.value ? 'rem' : 'px'
      const finalValue = `${numValue}${unit}`

      const oldWidth = element.value.style.width
      element.value.style.height = finalValue

      if (isRatioLocked.value && finalValue !== 'auto' && oldWidth && oldWidth !== 'auto') {
        const { num } = parseValue(finalValue)
        const newWidth = num * aspectRatio.value
        const { unit: widthUnit } = parseValue(oldWidth)
        element.value.style.width = formatValue(newWidth, widthUnit)
      }

      triggering()
    }
  },
})

watch([w, h], ([newW, newH]) => {
  if (newW && newH && newW !== 'auto' && newH !== 'auto' && !String(newW).includes('%') && !String(newH).includes('%')) {
    const wNum = Number.parseFloat(String(newW))
    const hNum = Number.parseFloat(String(newH))
    if (wNum > 0 && hNum > 0) {
      aspectRatio.value = wNum / hNum
    }
  }
}, { immediate: true })

watch(isRemUnit, () => {
  triggering()
})

function toggleUnit() {
  isRemUnit.value = !isRemUnit.value
}

function swapWidthHeight() {
  if (element.value) {
    const tempWidth = element.value.style.width
    element.value.style.width = element.value.style.height
    element.value.style.height = tempWidth
    triggering()
  }
}

function toggleRatioLock() {
  isRatioLocked.value = !isRatioLocked.value
  if (isRatioLocked.value) {
    const currentW = element.value?.style.width
    const currentH = element.value?.style.height
    if (currentW && currentH && currentW !== 'auto' && currentH !== 'auto') {
      const wNum = parseValue(currentW).num
      const hNum = parseValue(currentH).num
      if (wNum > 0 && hNum > 0) {
        aspectRatio.value = wNum / hNum
      }
    }
  }
}

const widthOptions = [
  { label: 'Auto', value: 'auto' },
  { label: 'Full (100%)', value: '100%' },
  { label: '12', value: '12' },
  { label: '24', value: '24' },
  { label: '36', value: '36' },
  { label: '48', value: '48' },
  { label: '64', value: '64' },
  { label: '72', value: '72' },
  { label: '96', value: '96' },
  { label: '120', value: '120' },
  { label: '150', value: '150' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
]
</script>

<template>
  <div text-xs flex="~ items-center gap-2" w-full>
    <div class="flex-1">
      <Select
        v-model="w"
        :options="widthOptions"
        placeholder="Width..."
        inputable
      >
        <template #prefix>
          <span op-50>W</span>
        </template>
        <template #suffix>
          <span v-if="w && w !== 'auto' && !String(w).includes('%')" op-50>{{ isRemUnit ? 'rem' : 'px' }}</span>
        </template>
      </Select>
    </div>

    <div flex="~ items-center gap-1" text-sm>
      <div
        i-hugeicons:exchange-01
        cursor-pointer
        op-50
        hover:op-100
        :class="{ 'op-100': isRemUnit }"
        @click="toggleUnit"
      />
      <div
        i-hugeicons:arrow-data-transfer-horizontal
        cursor-pointer
        op-50
        hover:op-100
        @click="swapWidthHeight"
      />
    </div>

    <div flex-1>
      <Select
        v-model="h"
        :options="widthOptions"
        placeholder="Height..."
        inputable
      >
        <template #prefix>
          <span op-50>H</span>
        </template>
        <template #suffix>
          <span v-if="h && h !== 'auto' && !String(h).includes('%')" op-50>{{ isRemUnit ? 'rem' : 'px' }}</span>
        </template>
      </Select>
    </div>

    <div flex="~ items-center gap-1" text-sm>
      <div
        i-hugeicons:connect
        cursor-pointer
        op-50
        hover:op-100
        :class="{ 'op-100! text-blue-500': isRatioLocked }"
        @click="toggleRatioLock"
      />
    </div>
  </div>
</template>
