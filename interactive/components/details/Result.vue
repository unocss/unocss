<script setup lang="ts">
import type { ResultItem } from '~/types'
import Summary from '../Summary.vue'

defineProps<{
  item?: ResultItem
}>()
</script>

<template>
  <div class="container" flex="~ col">
    <div h-full class="scrolls" flex-auto py8 px8>
      <template v-if="item">
        <DetailsGuide v-if="item.type === 'guide'" :key="item.title" :item="item" />
        <DetailsDoc v-else-if="'url' in item" :item="item" />
        <DetailsRule v-else :item="item" />
      </template>
      <Summary v-else />
    </div>
  </div>
</template>

<style scoped>
.container {
  height: calc(100vh - 1rem);
}
</style>
