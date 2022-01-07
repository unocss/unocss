<script setup lang="ts">
const props = defineProps<{ id: string }>()

const ext = computed(() => props.id.split(/\./g).pop())
const icon = computed(() => {
  switch (ext.value) {
    case 'vue':
      return 'i-logos-vue'
    default:
      return 'i-carbon-document-blank'
  }
})
</script>

<template>
  <div :class="icon" />
</template>
