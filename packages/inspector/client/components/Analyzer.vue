<script lang="ts" setup>
import { computed } from 'vue'
import { createReusableTemplate } from '@vueuse/core'
import { Dropdown } from 'floating-vue'
import type { MatchedColor, MatchedSelector, SuggestedShortcut } from '../../types'

type _MatchedSelector = Omit<MatchedSelector, 'modules'> & { modules: string[] }
type _MatchedColor = Omit<MatchedColor, 'modules'> & { modules: string[] }
type _SuggestedShortcut = Omit<SuggestedShortcut, 'modules'> & { modules: string[] }

interface Grouped {
  name: string
  count: number
  items: _MatchedSelector[]
}

const props = withDefaults(defineProps<{
  selectors: _MatchedSelector[]
  colors: _MatchedColor[]
  suggestedShortcuts?: _SuggestedShortcut[]
}>(), {
  suggestedShortcuts: () => [],
})
const [DefineDropdown, ReuseDropdown] = createReusableTemplate<{
  matched: { name: string; count: number; modules: string[] }
  showDocs?: boolean
}>()

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

function openEditor(id: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(id)}`)
}
</script>

<template>
  <div p-4 space-y-8>
    <DefineDropdown v-slot="{ matched, showDocs = true }">
      <div space-x-4 px4 py3>
        <Copy v-slot="{ copy, copied }">
          <button :class="copied ? 'text-green' : 'text-dark:50 hover:text-dark dark:text-white:50 dark:hover:text-white'" text-sm @click="copy(matched.name)">
            <div :class="copied ? 'i-carbon-checkmark-outline' : 'i-carbon-copy'" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </Copy>
        <a v-if="showDocs" :href="`https://unocss.dev/interactive/?s=${matched.name}`" target="_blank" text-sm text-dark:50 hover:text-dark dark:text-white:50 dark:hover:text-white>
          <div i-carbon-notebook />
          Docs
        </a>
      </div>
      <div border="t gray-400/20" max-h-60 of-auto px4 py3 text-sm>
        <div>
          <span op50>It has been referenced </span><strong>{{ matched.count }}</strong><span op50> times by:</span>
        </div>
        <div flex="~ col gap-2" items-start pt3>
          <a v-for="id in matched.modules" :key="id" text-sm cursor-pointer op80 hover:op100 @click="openEditor(id)">
            <ModuleId :id="id" mr-1 />
            <div i-carbon-launch />
          </a>
        </div>
      </div>
    </DefineDropdown>

    <div v-if="selectors.length > 10">
      <div mb-4 op50 uppercase text-sm>
        Top 10 Utilities
      </div>
      <div p-4 bg-gray-5:5 dark:bg-gray-5:10>
        <div flex="~ wrap" gap="x-2 y-2">
          <Dropdown v-for="(item, i) in selectors.slice(0, 10)" :key="i" :distance="10">
            <span
              font-mono text-sm cursor-pointer
              b="b transparent hover:current" op="50 hover:100"
            >
              <span>{{ item.name }}</span>
              <sup op50 ml-0.5>{{ item.count }}</sup>
            </span>
            <template #popper>
              <ReuseDropdown :matched="item" />
            </template>
          </Dropdown>
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
          <div p-2 w-25 inline-block of-hidden bg-gray-5:5 dark:bg-gray-5:10>
            <Dropdown :distance="10">
              <span b="b transparent hover:current" cursor-pointer ws-nowrap of-ellipsis of-hidden>
                <span text-sm of-ellipsis>{{ item.name }}</span>
                <sup text-xs ml-0.5 op50>{{ item.count }}</sup>
              </span>
              <template #popper>
                <ReuseDropdown :matched="item" :show-docs="false" />
              </template>
            </Dropdown>
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
        <div v-for="(group, key) in grouped" :key="key" p-4 bg-gray-5:5 dark:bg-gray-5:10>
          <div text-sm pb-4>
            <span capitalize>{{ group.name }}</span><sup op50 ml-1>{{ group.count }}</sup>
          </div>
          <div flex flex-wrap gap-x-2 gap-y-2>
            <Dropdown v-for="(item, i) in group.items" :key="i" :distance="10">
              <span
                font-mono text-sm cursor-pointer
                b="b transparent hover:current" op="50 hover:100"
              >
                <span>{{ item.name }}</span>
                <sup op50 ml-0.5>{{ item.count }}</sup>
              </span>
              <template #popper>
                <ReuseDropdown :matched="item" />
              </template>
            </Dropdown>
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
        <div v-for="(item, i) in suggestedShortcuts" :key="i" flex p-4 bg-gray-5:5 dark:bg-gray-5:10>
          <Dropdown :distance="10">
            <span cursor-pointer font-mono text-sm b="b transparent hover:current" op="50 hover:100">
              <span>{{ item.selectors.join(' ') }}</span>
              <sup op50 ml-0.5>{{ item.count }}</sup>
            </span>
            <template #popper>
              <ReuseDropdown :matched="item" :show-docs="false" />
            </template>
          </Dropdown>
        </div>
      </div>
    </div>
  </div>
</template>
