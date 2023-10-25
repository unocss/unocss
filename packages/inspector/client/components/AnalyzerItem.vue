<script setup lang="ts">
import { Dropdown } from 'floating-vue'
import { computed } from 'vue'
import type { MatchedSelector } from '../../types'
import { isAttributifySelector } from '../../../core/src'

const props = defineProps<{
  item: MatchedSelector
}>()

const isAttributify = computed(() => isAttributifySelector(props.item.name))
const name = computed(() => isAttributify.value
  ? `[${props.item.name.slice(1, -1).replace(/=""$/, '').replace(/~="/, '="')}]`
  : props.item.name)

function openEditor(id: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(id)}`)
}
</script>

<template>
  <Dropdown :distance="10">
    <span
      font-mono text-sm cursor-pointer
      border="b transparent hover:current"
      op="50 hover:100"
    >
      <span text-sm of-ellipsis>{{ name }}</span>
    </span>
    <sup text-xs ml-0.5 op30>{{ item.count }}</sup>
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
