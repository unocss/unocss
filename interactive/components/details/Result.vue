<script setup lang="ts">
import type { ResultItem } from '~/types'

defineProps<{
  item: ResultItem
}>()
</script>

<template>
  <div py8 px8 of-auto h-full>
    <DetailsGuide v-if="item.type === 'guide'" :key="item.title" :item="item" />
    <DetailsDoc v-else-if="'url' in item" :item="item" />
    <DetailsRule v-else :item="item" />
  </div>
</template>
