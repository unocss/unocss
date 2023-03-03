<script setup lang="ts">
const props = defineProps<{ id: string }>()

const ext = computed(() => props.id.toLowerCase().replace(/\?.*$/, '').split(/\./g).pop())
const icon = computed((): string => {
  switch (ext.value) {
    case 'vue':
      return 'i-vscode-icons-file-type-vue'
    case 'html':
    case 'htm':
      return 'i-vscode-icons-file-type-html'
    case 'svelte':
      return 'i-vscode-icons-file-type-svelte'
    case 'ts':
    case 'mts':
    case 'tsx':
    case 'cts':
      return 'i-vscode-icons-file-type-typescript-official'
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'i-vscode-icons-file-type-js-official'
    case 'json':
      return 'i-vscode-icons-file-type-json-official'
    case 'md':
    case 'markdown':
      return 'i-vscode-icons-file-type-markdown'
    default:
      return 'i-carbon-document-blank'
  }
})
</script>

<template>
  <div :class="icon" />
</template>
