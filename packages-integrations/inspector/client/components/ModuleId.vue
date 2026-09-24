<script setup lang="ts">
import { computed } from 'vue'
import { info } from '../composables/fetch'

const props = defineProps<{ id?: string }>()

const displayId = computed(() => {
  const root = info.value?.root
  if (!props.id || !root)
    return props.id || ''

  return props.id.startsWith(root) ? `./${props.id.slice(root.length)}` : props.id
})
</script>

<template>
  <InlineText v-if="id && info" :text="displayId" :title="id" class="max-w-full align-middle" />
</template>
