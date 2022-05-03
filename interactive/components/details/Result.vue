<script setup lang="ts">
import Summary from '../Summary.vue'
import type { ResultItem } from '~/types'

defineProps<{
  item?: ResultItem
}>()
</script>

<template>
  <div py8 px8 of-auto h-full>
    <template v-if="item">
      <DetailsGuide v-if="item.type === 'guide'" :key="item.title" :item="item" />
      <DetailsDoc v-else-if="'url' in item" :item="item" />
      <DetailsRule v-else :item="item" />
    </template>
    <Summary v-else />
  </div>
</template>
