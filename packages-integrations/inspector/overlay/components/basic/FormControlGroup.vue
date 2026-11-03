<script lang='ts' setup>
import { computed, provide, watchEffect } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'checkbox' | 'radio'
}>(), {
  type: 'checkbox',
})

const model = defineModel<string[] | string>()

watchEffect(() => {
  model.value ??= props.type === 'checkbox' ? [] : ''
})

function toggle(value: string) {
  if (props.type === 'checkbox' && Array.isArray(model.value)) {
    const index = model.value.indexOf(value)
    if (index === -1) {
      model.value = [...model.value, value]
    }
    else {
      model.value = model.value.filter(item => item !== value)
    }
  }
}

function select(value: string) {
  if (props.type === 'radio') {
    model.value = value
  }
  else if (props.type === 'checkbox' && Array.isArray(model.value)) {
    if (!model.value.includes(value)) {
      model.value = [...model.value, value]
    }
  }
}

function isChecked(value: string) {
  if (props.type === 'checkbox' && Array.isArray(model.value)) {
    return model.value.includes(value)
  }
  else if (props.type === 'radio') {
    return model.value === value
  }
  return false
}

provide('controlGroup', {
  toggle,
  select,
  isChecked,
  modelValue: computed(() => model.value),
  type: props.type,
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
