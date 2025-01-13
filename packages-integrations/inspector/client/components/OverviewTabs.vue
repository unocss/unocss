<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', payload: string): void }>()
const tabs = ref([
  { label: 'Source', value: 'source', icon: 'i-carbon-cics-program' },
  { label: 'Analyzer', value: 'analyzer', icon: 'i-carbon-align-horizontal-left' },
])
const active = useVModel(props, 'modelValue', emit)
</script>

<template>
  <Tabs v-model="active" :items="tabs" />
</template>
