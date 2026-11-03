<script lang='ts' setup>
import { computed } from 'vue'
import { useClassList } from '../../../composables/classList'
import { useElement } from '../../../composables/exports'
import FormControl from '../../basic/FormControl.vue'
import { hasUtilityPrefix, withoutClasses } from './helper'
import WH from './WH.vue'

const { element, tracking } = useElement()
const { classList } = useClassList()

const overflowClassChecks = [
  hasUtilityPrefix('overflow-'),
]

const clip = computed({
  get: () => {
    if (element.value) {
      tracking()
      const computedStyle = window.getComputedStyle(element.value)
      return computedStyle.overflow && computedStyle.overflow !== 'visible'
    }
    return false
  },
  set: (value: boolean) => {
    if (element.value) {
      const baseClasses = withoutClasses(classList.value, overflowClassChecks)
      classList.value = [
        ...baseClasses,
        value ? 'overflow-hidden' : 'overflow-visible',
      ]
    }
  },
})
</script>

<template>
  <div>
    <WH />
    <FormControl
      v-model="clip"
      mt-2
      style="--context-color: var(--colors-sky-DEFAULT)"
      label="Clip Content"
    />
  </div>
</template>
