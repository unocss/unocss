<script setup lang="ts">
import { computed } from 'vue'
import { info } from '../composables/fetch'

const props = defineProps<{ id?: string }>()

const displayId = computed(() => {
  const root = info.value?.root
  if (!props.id || !root)
    return props.id || ''

  // Normalize the boundary before adding `./`: slicing only `root.length`
  // leaves the separator from the absolute path, which would render as `.//`.
  const normalizedRoot = root.replace(/\\/g, '/').replace(/\/+$/, '')
  const normalizedId = props.id.replace(/\\/g, '/')
  const rootPrefix = normalizedRoot ? `${normalizedRoot}/` : '/'

  if (normalizedId === normalizedRoot)
    return './'

  return normalizedId.startsWith(rootPrefix)
    ? `./${normalizedId.slice(rootPrefix.length)}`
    : props.id
})
</script>

<template>
  <InlineText v-if="id && info" :text="displayId" :title="id" class="max-w-full align-middle" />
</template>
