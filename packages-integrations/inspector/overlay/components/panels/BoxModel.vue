<script lang='ts' setup>
import { computed } from 'vue'
import { useElement } from '../../composables/exports/element'

const { element, tracking } = useElement()

const boxModel = computed(() => {
  tracking()

  if (!element.value) {
    return null
  }

  const el = element.value
  const computedStyle = window.getComputedStyle(el)
  const rect = el.getBoundingClientRect()

  return {
    margin: {
      top: Number.parseFloat(computedStyle.marginTop),
      right: Number.parseFloat(computedStyle.marginRight),
      bottom: Number.parseFloat(computedStyle.marginBottom),
      left: Number.parseFloat(computedStyle.marginLeft),
    },
    border: {
      top: Number.parseFloat(computedStyle.borderTopWidth),
      right: Number.parseFloat(computedStyle.borderRightWidth),
      bottom: Number.parseFloat(computedStyle.borderBottomWidth),
      left: Number.parseFloat(computedStyle.borderLeftWidth),
    },
    padding: {
      top: Number.parseFloat(computedStyle.paddingTop),
      right: Number.parseFloat(computedStyle.paddingRight),
      bottom: Number.parseFloat(computedStyle.paddingBottom),
      left: Number.parseFloat(computedStyle.paddingLeft),
    },
    size: {
      width: rect.width,
      height: rect.height,
    },
  }
})

function formatBoxValue(value: number): string {
  return value === 0 ? '0' : `${value}px`
}
</script>

<template>
  <div v-if="boxModel" class="lh-loose flex items-center justify-center p-4">
    <div
      b="~ dashed inspect-margin"
      class="w-full bg-inspect-margin bg-op-50 p-5 relative"
    >
      <div class="box-model-title">
        margin
      </div>
      <div class="box-model-labels">
        <span class="box-model-text top-0 left-1/2 -translate-x-1/2 translate-y-0">{{ formatBoxValue(boxModel.margin.top) }}</span>
        <span class="box-model-text top-1/2 right-0 -translate-y-1/2 translate-x-0">{{ formatBoxValue(boxModel.margin.right) }}</span>
        <span class="box-model-text bottom-0 left-1/2 -translate-x-1/2 translate-y-0">{{ formatBoxValue(boxModel.margin.bottom) }}</span>
        <span class="box-model-text top-1/2 left-0 -translate-y-1/2 translate-x-0">{{ formatBoxValue(boxModel.margin.left) }}</span>
      </div>

      <div
        b="~ solid inspect-border/35"
        class="bg-inspect-border/35 p-5 relative text-center"
      >
        <div class="box-model-title">
          border
        </div>
        <div class="box-model-labels">
          <span class="box-model-text top-0 left-1/2 -translate-x-1/2 translate-y-0">{{ formatBoxValue(boxModel.border.top) }}</span>
          <span class="box-model-text top-1/2 right-0 -translate-y-1/2 translate-x-0">{{ formatBoxValue(boxModel.border.right) }}</span>
          <span class="box-model-text bottom-0 left-1/2 -translate-x-1/2 translate-y-0">{{ formatBoxValue(boxModel.border.bottom) }}</span>
          <span class="box-model-text top-1/2 left-0 -translate-y-1/2 translate-x-0">{{ formatBoxValue(boxModel.border.left) }}</span>
        </div>

        <div
          b="~ dashed inspect-padding"
          class="bg-inspect-padding/40 p-5 relative text-center"
        >
          <div class="box-model-title">
            padding
          </div>
          <div class="box-model-labels">
            <span class="box-model-text top-0 left-1/2 -translate-x-1/2 translate-y-0">{{ formatBoxValue(boxModel.padding.top) }}</span>
            <span class="box-model-text top-1/2 right-0 -translate-y-1/2 translate-x-0">{{ formatBoxValue(boxModel.padding.right) }}</span>
            <span class="box-model-text bottom-0 left-1/2 -translate-x-1/2 translate-y-0">{{ formatBoxValue(boxModel.padding.bottom) }}</span>
            <span class="box-model-text top-1/2 left-0 -translate-y-1/2 translate-x-0">{{ formatBoxValue(boxModel.padding.left) }}</span>
          </div>

          <div class="border border-inspect-content bg-inspect-content/40 min-h-10 flex items-center justify-center">
            <div class="text-10px">
              {{ Math.round(boxModel.size.width) }} × {{ Math.round(boxModel.size.height) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
