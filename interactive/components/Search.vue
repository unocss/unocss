<script setup lang="ts">
import type { ResultItem } from '~/types'
import { input, isSearching, searchResult, selectIndex } from '~/composables/state'

const router = useRouter()
const inputEl = $ref<HTMLInputElement>()

initSearch()

function moveIndex(delta: number) {
  selectIndex.value = (selectIndex.value + delta + searchResult.value.length) % searchResult.value.length
}

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
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey)
    return
  inputEl?.focus()
})

function clear() {
  router.push({ query: { s: '' } })
}

function openItem(item: ResultItem) {
  if (isMobile.value && !isModalOpen.value)
    isModalOpen.value = true
  else
    input.value = getItemId(item)
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
  <div h-full grid="~ rows-[min-content_min-content_1fr]" of-hidden>
    <TheNav />
    <div relative border="~ rounded base" shadow>
      <input
        ref="inputEl"
        v-model="input"
        placeholder="Type to explore..."
        type="text"
        autocomplete="off"
        w="full" p="x6 y4"
        border-none bg-transparent
        text-2xl font-200
        outline="none active:none"
      >
      <button
        v-if="input"
        absolute flex right-2 w-10 top-2 bottom-2 text-xl op30 hover:op90
        @click="clear()"
      >
        <div i-carbon-close ma />
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
      <template v-for="i, idx of searchResult" :key="idx">
        <ResultItem
          :item="i"
          :active="selectIndex === idx"
          @click="selectItem(i)"
        />
        <div divider />
      </template>
    </div>
    <Info v-else-if="!input" />
    <div v-else p10>
      <div op40 italic mb5>
        No result found
      </div>
      <div row justify-center>
        <button btn @click="input = ''">
          Clear
        </button>
      </div>
    </div>
  </div>
</template>
