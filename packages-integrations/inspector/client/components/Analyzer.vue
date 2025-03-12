<script lang="ts" setup>
import type { MatchedColor, MatchedSelector } from '../../types'
import { computed, ref } from 'vue'
import { FlowLayout } from 'vue-flow-layout'

interface Grouped {
  name: string
  count: number
  items: MatchedSelector[]
}

const props = defineProps<{
  selectors: MatchedSelector[]
  icons: MatchedSelector[]
  colors: MatchedColor[]
}>()

const mergeSameUtil = ref(true)
const selectors = computed(() => [...props.selectors].sort((a, b) => b.count - a.count))

const matchedColors = computed<MatchedColor[]>(() => {
  return (props.colors || [])
    .map(item => ({ ...item, name: item.no === 'DEFAULT' ? `${item.name}` : `${item.name}-${item.no}` }))
    .sort((a, b) => b.count - a.count)
})

const mergedSelectors = computed(() => {
  if (!mergeSameUtil.value)
    return selectors.value

  const map = new Map<string, MatchedSelector>()
  selectors.value.forEach((item) => {
    const key = item.body
    const target = map.get(key)
    if (target) {
      target.alias ||= {
        [target.name]: target.count,
      }
      target.alias[item.name] = item.count
      target.count += item.count
      target.modules ||= []
      for (const module of item.modules) {
        if (!target.modules.includes(module)) {
          target.modules.push(module)
        }
      }
    }
    else {
      map.set(key, structuredClone(item))
    }
  })

  const sorted = [...map.values()]
    .sort((a, b) => b.count - a.count)

  // Use name without bracket if possible
  // `[text-sm] text-sm` -> `text-sm`
  sorted.forEach((item) => {
    if (item.alias) {
      item.name = Object.keys(item.alias)
        .sort((a, b) => b.localeCompare(a))[0]
    }
  })

  return sorted
})

const grouped = computed(() => mergedSelectors
  .value
  .reduce<Grouped[]>((acc, item) => {
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
  }, [])
  .sort((a, b) => b.count - a.count),
)
</script>

<template>
  <div p-4 space-y-8>
    <label flex="~ gap-2 items-center">
      <input v-model="mergeSameUtil" type="checkbox">
      <span>Merge Alias</span>
    </label>
    <div v-if="selectors.length > 10">
      <div mb-4 op50 uppercase text-sm>
        Top 10 Utilities
      </div>
      <div p-4 bg-active>
        <div flex="~ wrap" gap="x-2 y-2">
          <AnalyzerItem
            v-for="(item, i) in mergedSelectors.slice(0, 10)"
            :key="i"
            :item="item"
          />
        </div>
      </div>
    </div>

    <div v-if="matchedColors.length">
      <div uppercase text-sm mb-4 op50>
        Color Palette
        <sup op50 text-sm>{{ matchedColors.length }}</sup>
      </div>
      <div flex flex-wrap gap-2>
        <span v-for="(item, i) in matchedColors" :key="i">
          <div p-2 w-25 inline-block of-hidden bg-active>
            <AnalyzerItem :item="item" />
            <div font-mono text-sm op50 ws-nowrap text-ellipsis of-hidden>{{ item.color }}</div>
            <div h-10 mt-1 :style="{ background: item.color }" />
          </div>
        </span>
      </div>
    </div>

    <div v-if="icons.length">
      <div uppercase text-sm mb-4 op50>
        Icon Set
        <sup op50 text-sm>{{ icons.length }}</sup>
      </div>
      <div flex flex-wrap gap-2>
        <span v-for="(item, i) in icons" :key="i">
          <AnalyzerItem :item="item" />
        </span>
      </div>
    </div>

    <div>
      <div mb4 op50 uppercase text-sm flex="~ gap-4 items-center">
        Utilities Usage
      </div>

      <FlowLayout v-if="grouped.length" :cols="2" :gap="16">
        <div v-for="(group, key) in grouped" :key="key" p-4 bg-active>
          <div text-sm pb-4>
            <span capitalize>{{ group.name }}</span><sup op50 ml-1>{{ group.count }}</sup>
          </div>
          <div flex flex-wrap gap-x-2 gap-y-2>
            <AnalyzerItem v-for="(item, i) in group.items" :key="i" :item="item" />
          </div>
        </div>
      </FlowLayout>
      <div v-else op50>
        No utilities found.
      </div>
    </div>
  </div>
</template>
