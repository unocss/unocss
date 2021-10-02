<script setup lang="ts">
import { useCodeMirror } from '../codemirror'

const props = defineProps<{
  modelValue: string
  mode?: string
  readOnly?: boolean
}>()
const emit = defineEmits<{
  (input: any): void
}>()

const el = ref<HTMLTextAreaElement>()
const input = useVModel(props, 'modelValue', emit, { passive: true })

onMounted(() => {
  useCodeMirror(el, input, props)
})
</script>

<template>
  <div>
    <textarea ref="el" />
  </div>
</template>
