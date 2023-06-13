<script lang="ts" setup>
import { computed } from 'vue'
import type { MatchedColor, MatchedSelector, SuggestedShortcut } from '../../types'

interface Grouped {
  name: string
  count: number
  items: MatchedSelector[]
}

const props = withDefaults(defineProps<{
  selectors: MatchedSelector[]
  colors: MatchedColor[]
  suggestedShortcuts?: SuggestedShortcut[]
}>(), {
  suggestedShortcuts: () => [],
})

const selectors = computed(() => [...props.selectors].sort((a, b) => b.count - a.count))

const colors = computed(() => {
  return (props.colors || [])
    .map(item => ({ ...item, name: item.no === 'DEFAULT' ? `${item.name}` : `${item.name}-${item.no}` }))
    .sort((a, b) => b.count - a.count)
})

const suggestedShortcuts = computed(() => [...props.suggestedShortcuts].sort((a, b) => b.count - a.count) || [])

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
      <div p-4 bg-gray-5:5 dark:bg-gray-5:10>
        <div flex="~ wrap" gap="x-2 y-2">
          <a
            v-for="(item, i) in selectors.slice(0, 10)" :key="i" target="_blank"
            :href="`https://unocss.dev/interactive/?s=${item.rawSelector}`" font-mono text-sm
            b="b transparent hover:current" op="50 hover:100"
          >
            <span>{{ item.rawSelector }}</span>
            <sup op50 ml-0.5>{{ item.count }}</sup>
          </a>
        </div>
      </div>
    </div>
    <div v-if="colors.length">
      <div uppercase text-sm mb-4 op50>
        Color Palette
        <sup op50 text-sm>{{ colors.length }}</sup>
      </div>
      <div flex flex-wrap gap-2>
        <span v-for="({ name, color, count }, i) in colors" :key="i">
          <div p-2 w-25 inline-block of-hidden bg-gray-5:5 dark:bg-gray-5:10>
            <div ws-nowrap of-ellipsis of-hidden>
              <span text-sm of-ellipsis>{{ name }}</span>
              <sup text-xs ml-0.5 op50>{{ count }}</sup>
            </div>
            <div font-mono text-sm op50 ws-nowrap of-ellipsis of-hidden>{{ color }}</div>
            <div h-10 mt-1 :style="{ background: color }" />
          </div>
        </span>
      </div>
    </div>
    <div>
      <div mb-4 op50 uppercase text-sm>
        Utilities Usage
      </div>
      <div v-if="grouped.length" grid="~ cols-1 md:cols-2 gap-4">
        <div v-for="(group, key) in grouped" :key="key" p-4 bg-gray-5:5 dark:bg-gray-5:10>
          <div text-sm pb-4>
            <span capitalize>{{ group.name }}</span><sup op50 ml-1>{{ group.count }}</sup>
          </div>
          <div flex flex-wrap gap-x-2 gap-y-2>
            <a
              v-for="(item, i) in group.items" :key="i" target="_blank"
              :href="`https://unocss.dev/interactive/?s=${item.rawSelector}`" font-mono text-sm
              b="b transparent hover:current" op="50 hover:100" :class="item.variants?.length ? 'op75' : 'op50'"
            >
              <span>{{ item.rawSelector }}</span>
              <sup op50 ml-0.5>{{ item.count }}</sup>
            </a>
          </div>
        </div>
      </div>
      <div v-else op50>
        No utilities found.
      </div>
    </div>
    <div v-if="suggestedShortcuts.length">
      <div mb-4 op50 uppercase text-sm>
        Suggested Shortcuts
        <sup op50 text-sm>{{ suggestedShortcuts.length }}</sup>
      </div>
      <div grid gap-4>
        <div v-for="(item, i) in suggestedShortcuts" :key="i" p-4 bg-gray-5:5 dark:bg-gray-5:10 space-x-3>
          <span font-mono text-sm b="b transparent hover:current" op="50 hover:100">
            <span>{{ item.selectors.join(' ') }}</span>
            <sup op50 ml-0.5>{{ item.count }}</sup>
          </span>
          <Copy v-slot="{ copy, copied }">
            <button
              :class="copied ? 'i-carbon-checkmark-outline text-green op100' : 'i-carbon-copy op50'" w-4 h-4
              hover:op100 cursor-pointer ma title="Copy" @click="copy(item.selectors.join(' '))"
            />
          </Copy>
        </div>
      </div>
    </div>
  </div>
</template>
