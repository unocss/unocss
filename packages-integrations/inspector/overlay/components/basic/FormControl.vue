<script lang='ts' setup>
import { computed, inject } from 'vue'

const props = withDefaults(defineProps<{
  id?: string
  label?: string
  disabled?: boolean
  modelValue?: string | boolean
  shape?: 'square' | 'round'
  type?: 'checkbox' | 'radio'
  size?: number
}>(), {
  shape: 'square',
  type: 'checkbox',
  size: 4,
})

const model = defineModel<boolean | string>()
const realId = props.id || Math.random().toString(36).slice(2, 11)

const controlGroup = inject<{
  toggle: (value: string) => void
  select: (value: string) => void
  isChecked: (value: string) => boolean
  modelValue: { value: string[] | string }
  type: 'checkbox' | 'radio'
} | null>('controlGroup', null)

const checked = computed(() => {
  if (controlGroup && typeof props.modelValue === 'string') {
    return controlGroup.isChecked(props.modelValue)
  }
  return Boolean(model.value)
})

function handleToggle() {
  if (controlGroup && typeof props.modelValue === 'string') {
    if (props.type === 'radio' || controlGroup.type === 'radio') {
      controlGroup.select(props.modelValue)
    }
    else {
      controlGroup.toggle(props.modelValue)
    }
  }
  else {
    if (props.type === 'radio') {
      model.value = true
    }
    else {
      model.value = !model.value
    }
  }
}

function handleLabelClick(event: Event) {
  event.preventDefault()
  handleToggle()
}
</script>

<template>
  <div inline-flex w-fit flex="items-center gap-0.75" children:cursor-pointer select-none>
    <div
      class="inline-flex items-center relative"
      :class="{
        'opacity-50 cursor-not-allowed': disabled,
      }"
      @click="handleToggle"
    >
      <input
        :id="realId"
        :checked="checked"
        :type="type"
        :disabled="disabled"
        class="btn-clear peer checked:b-$context-color/50 b b-solid b-white/30"
        :class="shape === 'square' ? 'rd-sm' : 'rd-full'"
        style="--webkit-appearance: none; -moz-appearance: none; appearance: none;"
        :style="{
          width: `calc(var(--spacing) * ${props.size})`,
          height: `calc(var(--spacing) * ${props.size})`,
        }"
      >
      <div
        class="pos-center transition-all size-0 peer-checked:size-58% peer-checked:bg-$context-color"
        :class="shape === 'square' ? 'rd-2px' : 'rd-full'"
      />
    </div>
    <label v-if="label" transition-opacity :class="{ 'op-50': !checked }" :for="realId" class="text-3.25 leading-normal whitespace-nowrap" @click="handleLabelClick">{{ label }}</label>
  </div>
</template>
