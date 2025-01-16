<script setup lang="ts">
import type { MatchedSelector } from '../../types'
import { isAttributifySelector } from '@unocss/core'
import { Dropdown } from 'floating-vue'
import { computed } from 'vue'

const props = defineProps<{
  item: MatchedSelector
}>()

const name = computed(() => {
  const isAttributify = isAttributifySelector(props.item.name)
  return isAttributify
    ? `[${props.item.name.slice(1, -1).replace(/=""$/, '').replace(/~="/, '="')}]`
    : props.item.name
})

function openEditor(id: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(id)}`)
}
</script>

<template>
  <Dropdown :distance="10">
    <span
      op="50 hover:100"
      :class="item.variants?.includes('dark') ? 'op-20! dark:op-80!' : ''"
    >
      <span
        font-mono text-sm cursor-pointer
        border="b transparent hover:current"
        :class="item.category === 'icons' ? 'border-b-0' : ''"
      >
        <i v-if="item.category === 'icons'" :class="[item.baseSelector, item.name]" />
        <span v-else>
          {{ name }}
        </span>
      </span>
      <sup text-xs ml-0.5>{{ item.count }}</sup>
    </span>
    <template #popper>
      <div space-x-4 px4 py3>
        <Copy v-slot="{ copy, copied }">
          <button
            :class="copied ? 'text-green' : 'text-dark:50 hover:text-dark dark:text-white:50 dark:hover:text-white'" text-sm
            @click="copy(item.name)"
          >
            <div :class="copied ? 'i-carbon-checkmark-outline' : 'i-carbon-copy'" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </Copy>
        <a v-if="item" :href="`https://unocss.dev/interactive/?s=${item.name}`" target="_blank" text-sm text-dark:50 hover:text-dark dark:text-white:50 dark:hover:text-white>
          <div i-carbon-notebook />
          Docs
        </a>
      </div>
      <div v-if="item.alias" border="t gray-400/20" of-auto px4 py3 text-sm>
        <div op75 mb2>
          Alias
        </div>
        <div flex="~ gap-2 wrap">
          <span
            v-for="([aName, aCount]) of Object.entries(item.alias)" :key="aName"
            font-mono op50
          >
            <span>{{ aName }}</span>
            <sup text-xs ml-0.5>{{ aCount }}</sup>
          </span>
        </div>
      </div>
      <div border="t gray-400/20" max-h-60 of-auto px4 py3 text-sm>
        <div>
          <span op50>It has been referenced </span><strong>{{ item.count }}</strong><span op50> times by:</span>
        </div>
        <div flex="~ col gap-2" items-start pt3>
          <a v-for="id in item.modules" :key="id" text-sm cursor-pointer op80 hover:op100 @click="openEditor(id)">
            <ModuleId :id="id" mr-1 />
            <div i-carbon-launch />
          </a>
        </div>
      </div>
    </template>
  </Dropdown>
</template>
