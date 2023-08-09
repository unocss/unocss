<script lang="ts" setup>
import { computed } from 'vue'
import type { MatchedColor, MatchedSelector } from '../../types'

interface Grouped {
  name: string
  count: number
  items: MatchedSelector[]
}

const props = defineProps<{
  selectors: MatchedSelector[]
  colors: MatchedColor[]
}>()

const selectors = computed(() => [...props.selectors].sort((a, b) => b.count - a.count))

const colors = computed(() => {
  return (props.colors || [])
    .map(item => ({ ...item, name: item.no === 'DEFAULT' ? `${item.name}` : `${item.name}-${item.no}` }))
    .sort((a, b) => b.count - a.count)
})

const grouped = computed(() => {
  return selectors.value.reduce<Grouped[]>((acc, item) => {
    const key = item.category
    const target = acc.find(_item => _item.name === key)

    if (target) {
      target.items.push(item)
      target.count += item.count
    }
    else {
      acc.push({
        name: key,
        count: item.count,
        items: [item],
      })
    }
    return acc
  }, []).sort((a, b) => b.count - a.count)
})
</script>

<template>
  <div p-4 space-y-8>
    <div v-if="selectors.length > 10">
      <div mb-4 op50 uppercase text-sm>
        Top 10 Utilities
      </div>
      <div p-4 bg-active>
        <div flex="~ wrap" gap="x-2 y-2">
          <AnalyzerItem
            v-for="(item, i) in selectors.slice(0, 10)"
            :key="i"
            :item="item"
          />
        </div>
      </div>
    </div>
    <div v-if="colors.length">
      <div uppercase text-sm mb-4 op50>
        Color Palette
        <sup op50 text-sm>{{ colors.length }}</sup>
      </div>
      <div flex flex-wrap gap-2>
        <span v-for="(item, i) in colors" :key="i">
          <div p-2 w-25 inline-block of-hidden bg-active>
            <AnalyzerItem :item="item" />
            <div font-mono text-sm op50 ws-nowrap of-ellipsis of-hidden>{{ item.color }}</div>
            <div h-10 mt-1 :style="{ background: item.color }" />
          </div>
        </span>
      </div>
    </div>
    <div>
      <div mb-4 op50 uppercase text-sm>
        Utilities Usage
      </div>
      <div v-if="grouped.length" grid="~ cols-1 md:cols-2 gap-4">
        <div v-for="(group, key) in grouped" :key="key" p-4 bg-active>
          <div text-sm pb-4>
            <span capitalize>{{ group.name }}</span><sup op50 ml-1>{{ group.count }}</sup>
          </div>
          <div flex flex-wrap gap-x-2 gap-y-2>
            <AnalyzerItem v-for="(item, i) in group.items" :key="i" :item="item" />
          </div>
        </div>
      </div>
      <div v-else op50>
        No utilities found.
      </div>
    </div>
  </div>
</template>
