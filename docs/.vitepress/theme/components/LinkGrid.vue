<script setup lang="ts">
import type { Integration } from '../../content'

defineProps<{
  items: Integration[]
}>()
</script>

<template>
  <div flex="~ wrap gap-2">
    <a
      v-for="item of items" :key="item.name" class="Link" :href="item.link"
      w-30 h-30 text-center text-inherit
      flex="~ col items-center justify-center"
    >
      <div v-if="item.icon.startsWith('i')" :class="item.icon" w-10 h-10 mb2 />
      <img v-else :src="item.icon" w-10 h-10 mb2>
      <span text-sm>{{ item.name }}</span>
      <span text-xs op50>{{ item.secondary }}</span>
    </a>
  </div>
</template>

<style scoped>
.Link {
  color: inherit !important;
  text-decoration: none !important;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
}
.Link:hover {
  color: var(--vp-c-brand) !important;
  border-color: var(--vp-c-brand) !important;
}
</style>
