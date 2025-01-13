<script setup lang="ts">
import type { ResultItem } from '~/types'

import { onBeforeRouteUpdate } from 'vue-router'

// @ts-expect-error missing types
import { RecycleScroller } from 'vue-virtual-scroller'
import { input, isSearching, searchResult, selectIndex, userConfigLoading } from '~/composables/state'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const route = useRoute()
const router = useRouter()
const scrollerRef = ref()
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

function mapSearch(result: import('#docs').ResultItem[]) {
  return result.map((item) => {
    if (item.type === 'guide') {
      return {
        ...item,
        size: 44,
        id: item.name,
      }
    }

    if (item.type === 'rule') {
      return {
        ...item,
        size: 56,
        id: item.class,
      }
    }

    return {
      ...item,
      size: 80,
      id: item.url,
    }
  })
}

async function executeSearch() {
  if (input.value)
    isSearching.value = true
  try {
    searchResult.value = mapSearch(await searcher.value?.search(input.value) || [])
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
    e.preventDefault()
    nextTick(() => {
      moveIndex(1)
    })
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    nextTick(() => {
      moveIndex(-1)
    })
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
    input.value = await searcher.value.getItemId(item)
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
watchEffect(() => {
  const current = selectIndex.value
  if (current < 0 || current >= searchResult.value.length)
    return

  scrollerRef.value?.scrollToItem?.(current)
})
</script>

<template>
  <div relative border="~ rounded main" shadow font-200 text-2xl>
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
  <div v-if="searchResult.length || isSearching" class="search-container">
    <div border="l b r main" mx2 class="scrolls" flex-auto>
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
      <template v-else>
        <RecycleScroller
          ref="scrollerRef"
          page-mode
          key-field="id"
          type-field="type"
          :size-field="isCompact ? undefined : 'size'"
          :item-size="isCompact ? 40 : undefined"
          :items="searchResult"
        >
          <template #default="{ item, index }">
            <ResultItem
              :item="item"
              :index="index"
              @click="selectItem(item)"
            />
            <div divider />
          </template>
        </RecycleScroller>
      </template>
    </div>
  </div>
  <div v-else-if="!input" class="intro-container">
    <div class="scrolls" flex-auto>
      <Intro />
    </div>
  </div>
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

<style scoped>
.search-container,
.intro-container {
  height: calc(100vh - 140px);
}
.search-container > .scrolls {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  .search-container > .scrolls {
    scroll-behavior: auto;
  }
}
</style>
