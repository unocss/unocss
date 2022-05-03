<script setup lang="ts">
import type { Preset } from '@unocss/core'

defineProps<{
  preset?: Preset | undefined
  fallback?: string
}>()
</script>

<template>
  <a v-if="preset" :href="`https://npmjs.com/package/${preset.name}`" target="_blank">{{ preset.name }}</a>
  <span v-else>{{ fallback }}</span>
</template>
