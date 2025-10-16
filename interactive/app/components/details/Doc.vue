<script setup lang="ts">
import type { DocItem } from '~/types'

const { item } = defineProps<{
  item: DocItem
}>()

const caniuseItem = computed<DocItem>(() => ({
  id: item.id,
  size: item.size,
  type: 'caniuse',
  title: item.title,
  url: `https://caniuse.com/?search=${encodeURIComponent(item.title)}`,
}))

const relatives = computed(() => searcher.value?.getUtilsOfFeature(item.title) || [])
</script>

<template>
  <DetailsBase :title="`MDN: ${item.title}`">
    <div flex="~ col gap4" text-left>
      <div>
        <div op30 mb1>
          Link
        </div>
        <div border="~ main" flex="~ col">
          <a :href="item.url" target="_blank">
            <ResultItem :item="item" />
          </a>
          <div divider />
          <a :href="caniuseItem.url" target="_blank">
            <ResultItem :item="caniuseItem" />
          </a>
        </div>
      </div>
      <div v-if="relatives.length">
        <div op30 mb1>
          Relatives
        </div>
        <div border="~ main" flex="~ col">
          <template v-for="(a, idx) of relatives" :key="a.class">
            <div v-if="idx" divider />
            <RouterLink :to="{ query: { s: a.class } }">
              <ResultItem :item="a" />
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </DetailsBase>
</template>
