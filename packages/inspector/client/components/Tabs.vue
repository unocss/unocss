<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
  items: {
    value: string
    label: string
    icon: string
  }[]
}>()
const emit = defineEmits<{ (e: 'update:modelValue', payload: string): void }>()
const active = useVModel(props, 'modelValue', emit, { passive: true, defaultValue: props.items?.[0]?.value })
</script>

<template>
  <ul flex border="t main">
    <li
      v-for="{ label, value, icon } in items" :key="value" cursor-pointer px-4 py-3 whitespace-nowrap select-none
      :class="active === value ? 'bg-active dark:text-white text-black' : 'text-dark:50 dark:text-white:50'"
      @click="active = value"
    >
      <div :class="icon" />
      {{ label }}
    </li>
  </ul>
</template>
