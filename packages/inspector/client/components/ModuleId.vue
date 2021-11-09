<script setup lang="ts">
import { info } from '../composables/fetch'

defineProps<{ id?: string }>()
</script>

<template>
  <span v-if="id && info">
    <template v-if="id.startsWith(info.root)">
      <span op80>.</span>
      <span>{{ id.slice(info.root.length) }}</span>
    </template>
    <span v-else>{{ id }}</span>
  </span>
</template>
