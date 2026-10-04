<script lang='ts' setup>
const props = defineProps<{
  modelValue: string[]
  value: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function handleChange(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const selected = new Set(props.modelValue)

  if (input.checked)
    selected.add(props.value)
  else
    selected.delete(props.value)

  emit('update:modelValue', [...selected])
}
</script>

<template>
  <div class="flex items-center">
    <label class="relative flex items-center cursor-pointer" :for="value">
      <input
        :id="value" :value="value" type="checkbox" :checked="modelValue.includes(value)"
        class="peer size-3.75 cursor-pointer appearance-none rounded-1 border border-slate-300 checked:border-[var(--context-color)] transition-all"
        @change="handleChange"
      >
      <span
        class="absolute bg-[var(--context-color)] size-0 rounded-0.6 peer-checked:size-60% transition-all duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      />
    </label>
    <label class="ml-1 cursor-pointer select-none flex items-center justify-center gap-1" :for="value">
      {{ value }}
    </label>
  </div>
</template>
