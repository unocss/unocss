<script setup lang="ts">
import type { GuideItem } from '~/types'

const { item } = defineProps<{
  item: GuideItem
}>()

let component = $shallowRef<any>()
watch(
  () => item,
  async () => {
    component = undefined
    component = await item.component().then(i => i.default)
  },
  { immediate: true },
)
</script>

<template>
  <DetailsBase v-if="component" :title="item.title">
    <div class="markdown-body max-w-full mt4 text-left">
      <component :is="component" />
    </div>
  </DetailsBase>
  <div v-else ma animate-pulse animate-duration-600>
    <div i-carbon-circle-dash w-6 h-6 animate-spin ma />
    loading...
  </div>
</template>
