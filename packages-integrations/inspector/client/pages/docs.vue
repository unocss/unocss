<script setup lang="ts">
import { fetchDocsItem, fetchDocsSearch } from '../composables/fetch'

const route = useRoute()
const router = useRouter()

const input = ref(String(route.query.s || ''))
const selectIndex = ref(0)

const { data: results, isFetching } = fetchDocsSearch(input)
const selected = computed(() => results.value?.[selectIndex.value]?.class ?? '')
const { data: item } = fetchDocsItem(selected)

watch(results, () => selectIndex.value = 0)

// Keep the query in the URL, so a search can be shared or linked to
watch(input, (s) => {
  router.replace({ query: s ? { s } : {} })
})
watch(() => route.query.s, (s) => {
  if (s != null && String(s) !== input.value)
    input.value = String(s)
})

function select(token: string) {
  input.value = token
}

function move(delta: number) {
  const length = results.value?.length ?? 0
  if (length)
    selectIndex.value = (selectIndex.value + delta + length) % length
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    move(1)
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    move(-1)
  }
  else if (e.key === 'Enter' && selected.value) {
    select(selected.value)
  }
  else if (e.key === 'Escape') {
    input.value = ''
  }
}

const listEl = ref<HTMLElement>()
watch(selectIndex, async (idx) => {
  await nextTick()
  listEl.value?.children[idx]?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <div h-full grid="~ rows-[max-content_1fr]" of-hidden>
    <StatusBar>
      <div>
        Docs
      </div>
      <div op60>
        Search the utilities of this project — rules, shortcuts, variants and theme come from your own UnoCSS config.
      </div>
    </StatusBar>
    <div h-full of-hidden grid="~ cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div flex="~ col" of-hidden border="r main">
        <div relative border="b main">
          <input
            v-model="input"
            aria-label="Search utilities"
            placeholder="Search utilities, e.g. p-4, flex, color: red"
            type="text"
            autocomplete="off"
            spellcheck="false"
            w-full px-4 py-3 bg-transparent font-mono text-sm
            class="outline-none"
            @keydown="onKeydown"
          >
          <div v-if="isFetching" absolute right-3 top-0 bottom-0 flex items-center op-50>
            <span i-carbon-circle-dash animate-spin aria-hidden="true" />
          </div>
        </div>
        <div v-if="results?.length" ref="listEl" flex-1 of-auto>
          <button
            v-for="r, idx of results" :key="r.class"
            type="button"
            w-full flex items-center gap-3 px-3 py-2 text-left
            border="l-3 b main"
            :class="idx === selectIndex ? 'bg-active op-100' : 'op-70 hover:op-100 hover:bg-active'"
            :style="{ borderLeftColor: r.color ?? 'transparent' }"
            @click="selectIndex = idx"
            @dblclick="select(r.class)"
          >
            <DocsKindBadge :kind="r.kind" />
            <span min-w-0 flex="~ col">
              <span font-mono text-sm truncate>{{ r.class }}</span>
              <span font-mono text-xs op-50 truncate>{ {{ r.body }} }</span>
            </span>
          </button>
        </div>
        <div v-else-if="input && !isFetching" p-5 op-50 italic text-sm>
          No utility found
        </div>
        <div v-else-if="!input" p-5 op-50 text-sm>
          Type a class name or a CSS declaration to explore what your config generates.
        </div>
      </div>
      <div of-auto>
        <DocsDetail v-if="item" :item="item" @select="select" />
      </div>
    </div>
  </div>
</template>
