<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router'

import type { ResultItem } from '~/types'
import { input, isSearching, searchResult, selectIndex, userConfigLoading } from '~/composables/state'

const route = useRoute()
const router = useRouter()
const inputEl = ref<HTMLInputElement>()
const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
}

watch(
  () => route.query.s,
  async (val) => {
    input.value = String(val || '')
  },
)

async function executeSearch() {
  if (input.value)
    isSearching.value = true
  try {
    searchResult.value = await searcher.search(input.value)
  }
  catch (e) {
    console.error(e)
  }
  isSearching.value = false

  selectIndex.value = 0
  isModalOpen.value = false

  await router.replace({
    path: '/',
    query: input.value
      ? {
          s: input.value,
        }
      : undefined,
  })
}

watchDebounced(
  input,
  executeSearch,
  { debounce: 300, immediate: true },
)

useEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    moveIndex(1)
    e.preventDefault()
  }
  else if (e.key === 'ArrowUp') {
    moveIndex(-1)
    e.preventDefault()
  }
  else if (e.key === 'Enter') {
    const item = searchResult.value[selectIndex.value]

    if (item)
      openItem(item)
  }
  else if (e.key === 'Escape') {
    clear()
  }

  // allow typing from everywhere to search
  if (e.key.match(/^[\w:-]$/) && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey)
    inputEl.value?.focus()
})

onBeforeRouteUpdate(() => {
  nextTick().then(() => {
    inputEl.value?.focus()
  })
})

function moveIndex(delta: number) {
  selectIndex.value = (selectIndex.value + delta + searchResult.value.length) % searchResult.value.length
}

function clear() {
  router.push('/')
  nextTick().then(() => inputEl.value?.focus())
}

async function openItem(item: ResultItem) {
  if (isMobile.value && !isModalOpen.value)
    isModalOpen.value = true
  else
    input.value = await searcher.getItemId(item)
}

function selectItem(item: ResultItem) {
  const index = searchResult.value.indexOf(item)
  if (index < 0)
    return
  if (selectIndex.value !== index) {
    selectIndex.value = index
    if (isMobile.value && !isModalOpen.value)
      isModalOpen.value = true
  }
  else {
    openItem(item)
  }
}
</script>

<template>
  <div relative border="~ rounded base" shadow font-200 text-2xl>
    <div v-if="userConfigLoading" p="x6 y4" gap2 row items-center animate-pulse>
      <div i-carbon-circle-dash w-7 h-7 animate-spin />
      <div op50>
        loading config...
      </div>
    </div>
    <input
      v-else
      ref="inputEl"
      v-model="input"
      v-focus
      aria-label="Type to explore"
      placeholder="Type to explore..."
      type="text"
      autocomplete="off" w="full"
      p="x6 y4"
      bg-transparent border-none
      class="!outline-none"
    >
    <button
      v-if="input"
      absolute flex right-2 w-10 top-2 bottom-2 text-xl op30 hover:op90
      aria-label="Clear search"
      @click="clear()"
    >
      <span i-carbon-close ma block aria-hidden="true" />
    </button>
  </div>
  <div v-if="searchResult.length || isSearching" border="l b r base" mx2 of-auto>
    <template v-if="isSearching">
      <ItemBase>
        <template #badge>
          <div i-carbon-circle-dash w-5 h-5 animate-spin ma />
        </template>
        <template #title>
          Searching...
        </template>
      </ItemBase>
      <div divider />
    </template>
    <template v-for="(i, idx) of searchResult" :key="idx">
      <ResultItem
        :item="i"
        :active="selectIndex === idx"
        @click="selectItem(i)"
      />
      <div divider />
    </template>
  </div>
  <Intro v-else-if="!input" />
  <div v-else p10>
    <div op40 italic mb5>
      No result found
    </div>
    <div row justify-center>
      <button btn @click="clear()">
        Clear search
      </button>
    </div>
  </div>
</template>
