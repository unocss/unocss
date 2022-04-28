<script setup lang="ts">
import type { ResultItem } from '~/types'

defineProps<{
  item: ResultItem
}>()
</script>

<template>
  <div py8 px8 of-auto h-full>
    <Suspense>
      <DetailsGuide v-if="item.type === 'guide'" :item="item" />
      <DetailsDoc v-else-if="'url' in item" :item="item" />
      <DetailsRule v-else :item="item" />
      <template #fallback>
        <div ma animate-pulse animate-duration-600>
          <div i-carbon-circle-dash w-6 h-6 animate-spin ma />
          loading...
        </div>
      </template>
    </Suspense>
  </div>
</template>
