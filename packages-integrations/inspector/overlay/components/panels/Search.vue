<script lang='ts' setup>
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import cssLang from 'shiki/langs/css.mjs'
import vitesseDark from 'shiki/themes/vitesse-dark.mjs'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { changeRevision } from '../../client-rpc'
import { useInspectorSearch } from '../../composables/search'
import { useUnoCSS } from '../../composables/unocss'
import Empty from '../sections/Empty.vue'
import PanelTitle from '../sections/PanelTitle.vue'

const { generateCSS } = useUnoCSS()
const { searchQuery } = useInspectorSearch()

const query = searchQuery
const css = ref('')
const highlightedCSS = ref('')
const loading = ref(false)
const error = ref<string>()
const searchHistory = ref<string[]>([])

let timer: ReturnType<typeof setTimeout> | undefined
let requestId = 0
let highlighterPromise: ReturnType<typeof createHighlighterCore> | undefined

const MAX_HISTORY = 12
const STORAGE_KEY = 'unocss-inspector:search-history'

const utility = computed(() => query.value.trim())

function getStorage() {
  if (typeof window === 'undefined')
    return

  try {
    return window.localStorage
  }
  catch {
    return undefined
  }
}

function loadSearchHistory() {
  const storage = getStorage()
  if (!storage)
    return

  try {
    const value = JSON.parse(storage.getItem(STORAGE_KEY) || '[]')
    if (Array.isArray(value))
      searchHistory.value = value.filter(item => typeof item === 'string' && item.trim()).slice(0, MAX_HISTORY)
  }
  catch {
    searchHistory.value = []
  }
}

function saveSearchHistory() {
  const storage = getStorage()
  if (!storage)
    return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(searchHistory.value))
  }
  catch {}
}

function addSearchHistory(values: string[]) {
  const next = values.filter(Boolean)
  if (!next.length)
    return

  searchHistory.value = Array.from(new Set([
    ...next,
    ...searchHistory.value,
  ])).slice(0, MAX_HISTORY)
  saveSearchHistory()
}

function clearSearchHistory() {
  searchHistory.value = []
  saveSearchHistory()
}

function selectHistory(value: string) {
  query.value = value
}

function getHighlighter() {
  highlighterPromise ||= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [cssLang],
    themes: [vitesseDark],
  })

  return highlighterPromise
}

async function highlightCSS(value: string, id: number) {
  if (!value) {
    highlightedCSS.value = ''
    return
  }

  try {
    const highlighter = await getHighlighter()

    if (id !== requestId)
      return

    highlightedCSS.value = highlighter.codeToHtml(value, {
      lang: 'css',
      theme: 'vitesse-dark',
    })
  }
  catch {
    if (id === requestId)
      highlightedCSS.value = ''
  }
}

async function runSearch(value: string) {
  const id = ++requestId

  if (!value) {
    css.value = ''
    highlightedCSS.value = ''
    error.value = undefined
    loading.value = false
    return
  }

  loading.value = true
  error.value = undefined
  css.value = ''
  highlightedCSS.value = ''

  try {
    const result = await generateCSS(value, { preflights: false, safelist: false })

    if (id !== requestId)
      return

    css.value = result?.css || ''
    if (css.value)
      addSearchHistory(result?.matched || [])
    await highlightCSS(css.value, id)
  }
  catch (err) {
    if (id !== requestId)
      return

    css.value = ''
    highlightedCSS.value = ''
    error.value = err instanceof Error ? err.message : String(err)
  }
  finally {
    if (id === requestId)
      loading.value = false
  }
}

watch([utility, changeRevision], ([value]) => {
  if (timer)
    clearTimeout(timer)

  timer = setTimeout(runSearch, 180, value)
}, { immediate: true })

onMounted(loadSearchHistory)

onBeforeUnmount(() => {
  requestId++
  if (timer)
    clearTimeout(timer)
})
</script>

<template>
  <div class="h-full overflow-auto p-3 no-scrollbar">
    <PanelTitle title="Search" icon="i-hugeicons:search-01" />

    <label class="block">
      <span class="mb-1.5 block text-xs text-white/50">Utility</span>
      <div class="flex items-center gap-2 rounded-md border border-white/10 bg-white/4 px-2 py-1.5 transition-colors focus-within:border-white/25">
        <div class="i-hugeicons:search-01 text-white/45" />
        <input
          v-model="query"
          class="min-w-0 flex-1 border-none bg-transparent text-xs text-white/85 outline-none placeholder:text-white/30"
          name="uno-search"
          placeholder="e.g. text-red-500"
          spellcheck="false"
          autocomplete="off"
        >
        <div v-if="loading" class="i-hugeicons:loading-03 animate-spin text-white/45" />
      </div>
    </label>

    <div v-if="searchHistory.length" class="mt-3">
      <div class="mb-1.5 flex items-center justify-between gap-2 text-xs text-white/50">
        <div class="flex items-center gap-1">
          <div class="i-hugeicons:clock-04" />
          <span>History</span>
        </div>
        <div
          class="text-white/35 transition hover:text-white/70"
          title="Clear history"
          @click="clearSearchHistory"
        >
          <div class="i-hugeicons:delete-02" />
        </div>
      </div>
      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <button
          v-for="item in searchHistory"
          :key="item"
          type="button"
          class="min-w-0 max-w-full truncate border-none bg-transparent p-0 font-mono text-xs text-white/62 underline-transparent transition hover:text-green-200 hover:underline hover:decoration-green-300/70"
          :class="{ 'text-green-200': item === utility }"
          :title="item"
          @click="selectHistory(item)"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <div v-if="error" class="mt-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
      {{ error }}
    </div>

    <div v-else-if="css" class="mt-3">
      <div class="mb-1.5 flex items-center gap-1 text-xs text-white/50">
        <div class="i-hugeicons:code-circle" />
        <span>Generated CSS</span>
      </div>
      <div v-if="highlightedCSS" class="css-output" v-html="highlightedCSS" />
      <pre v-else class="m-0 max-h-80 overflow-auto rounded-md border border-white/8 bg-black/25 p-3 text-xs leading-relaxed text-white/78 no-scrollbar"><code>{{ css }}</code></pre>
    </div>

    <Empty
      v-else-if="utility && !loading"
      class="mt-2"
      title="No CSS"
      description="UnoCSS did not generate CSS for this utility."
      icon="i-hugeicons:search-remove"
    />

    <Empty
      v-else-if="!utility"
      class="mt-2"
      title="Search Utility"
      description="Type a utility class to generate its CSS."
      icon="i-hugeicons:search-01"
    />
  </div>
</template>

<style scoped>
.css-output :deep(.shiki) {
  margin: 0;
  max-height: 20rem;
  overflow: auto;
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 0.375rem;
  background-color: rgb(0 0 0 / 25%) !important;
  padding: 0.75rem;
  font-size: 0.75rem;
  line-height: 1.625;
}
</style>
