<script setup lang="ts">
import type { GuideItem } from '~/types'

const { item } = defineProps<{
  item: GuideItem
}>()

const component = await item.component().then(i => i.default)
</script>

<template>
  <DetailsBase :title="item.title">
    <div class="markdown-body max-w-full mt2 text-left">
      <component :is="component" />
    </div>
  </DetailsBase>
</template>
