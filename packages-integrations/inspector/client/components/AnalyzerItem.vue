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

const categoryLabel = computed(() => props.item.category === 'icons' ? 'Icon' : 'Utility')

const usageSummary = computed(() => {
  const files = props.item.modules.length
  const fileLabel = `${files} ${files === 1 ? 'file' : 'files'}`
  if (props.item.count < 0)
    return fileLabel
  return `${props.item.count} ${props.item.count === 1 ? 'use' : 'uses'} · ${fileLabel}`
})

const aliases = computed(() => Object.entries(props.item.alias || {}))

function openEditor(id: string) {
  fetch(`/__open-in-editor?file=${encodeURIComponent(id)}`)
}
</script>

<template>
  <Dropdown
    :distance="8"
    popper-class="[&_.v-popper\_\_inner]:rounded-lg [&_.v-popper\_\_inner]:border-gray/15 [&_.v-popper\_\_inner]:bg-light-100/95 [&_.v-popper\_\_inner]:text-dark-800 [&_.v-popper\_\_inner]:shadow-lg [&_.v-popper\_\_inner]:backdrop-blur-md dark:[&_.v-popper\_\_inner]:border-light-100/10 dark:[&_.v-popper\_\_inner]:bg-dark-800/95 dark:[&_.v-popper\_\_inner]:text-light-100 [&_.v-popper\_\_arrow-container]:hidden"
  >
    <span class="group">
      <span
        font-dm text-sm cursor-pointer
        :class="item.category === 'icons' ? 'border-b-0' : ''"
      >
        <i v-if="item.category === 'icons'" :class="[item.baseSelector, item.name]" />
        <span v-else>
          <InlineText :text="name" :title="name" class="max-w-64 align-bottom op-50 group-hover:op-100" />
        </span>
      </span>
      <sup
        text-xs ml-0.5 op-50 group-hover:op-100
        :class="item.variants?.includes('dark') ? 'op-20! dark:op-80!' : ''"
      >{{ item.count }}</sup>
    </span>
    <template #popper>
      <div class="w-72 max-w-full font-dm text-sm">
        <div class="flex min-w-0 items-center gap-2 px-3 py-2.5">
          <div class="flex shrink-0 items-center gap-1.5 text-xs font-medium text-gray5 dark:text-gray3">
            <span i-carbon-code aria-hidden="true" />
            <span>{{ categoryLabel }}</span>
          </div>
          <span class="min-w-0 truncate font-mono text-sm font-medium" :title="name">{{ name }}</span>
        </div>

        <div class="border-main flex items-center border-t px-1.5 py-1">
          <Copy v-slot="{ copy, copied }">
            <button type="button" class="inline-flex min-h-7 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 text-xs font-medium transition-colors hover:bg-active focus-visible:outline focus-visible:outline-blue5" :class="copied ? 'text-green5 dark:text-green4' : ''" @click="copy(item.name)">
              <span :class="copied ? 'i-carbon-checkmark-outline' : 'i-carbon-copy'" aria-hidden="true" />
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </Copy>
          <span class="border-main h-4 border-l" aria-hidden="true" />
          <a
            class="inline-flex min-h-7 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-inherit no-underline transition-colors hover:bg-active focus-visible:outline focus-visible:outline-blue5"
            :href="`https://unocss.dev/interactive/?s=${encodeURIComponent(item.name)}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span i-carbon-launch aria-hidden="true" />
            Playground
          </a>
        </div>

        <div v-if="aliases.length" class="border-main border-t px-3 py-2.5">
          <div class="flex items-center gap-1.5 text-xs font-medium text-gray5 dark:text-gray3">
            <span i-carbon-link aria-hidden="true" />
            Aliases
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <span v-for="[aName, aCount] of aliases" :key="aName" class="inline-flex max-w-full items-center gap-1.5 rounded bg-active px-1.5 py-0.5 font-mono text-xs" :title="aName">
              <InlineText :text="aName" />
              <span class="text-gray5 dark:text-gray3">{{ aCount }}</span>
            </span>
          </div>
        </div>

        <div class="border-main border-t px-3 py-2.5">
          <div class="flex items-center justify-between gap-2 text-xs font-medium text-gray5 dark:text-gray3">
            <span class="flex shrink-0 items-center gap-1.5">
              <span i-carbon-chart-line aria-hidden="true" />
              Usage
            </span>
            <span class="truncate">{{ usageSummary }}</span>
          </div>
          <div v-if="item.modules.length" class="mt-1 max-h-36 overflow-y-auto">
            <button
              v-for="id in item.modules"
              :key="id"
              type="button"
              class="flex min-h-7 w-full cursor-pointer items-center gap-2 rounded border-0 bg-transparent px-0 py-0.5 text-left text-inherit transition-colors hover:text-blue5 focus-visible:outline focus-visible:outline-blue5 dark:hover:text-blue3"
              :title="`Open ${id} in editor`"
              @click="openEditor(id)"
            >
              <span class="min-w-0 flex-1 truncate font-mono text-xs"><ModuleId :id="id" /></span>
              <span i-carbon-arrow-up-right class="shrink-0 text-gray5 dark:text-gray3" aria-hidden="true" />
            </button>
          </div>
          <div v-else class="mt-1 text-xs text-gray5 dark:text-gray3">
            No source files recorded.
          </div>
        </div>
      </div>
    </template>
  </Dropdown>
</template>
