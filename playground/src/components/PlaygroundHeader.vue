<!-- eslint-disable vue/no-mutating-props -->
<script lang='ts' setup>
import type { ReplStore } from '@unocss/repl'

const props = defineProps<{
  store: ReplStore
}>()

const emit = defineEmits<{
  toggleDark: []
}>()

const { copy, copied } = useClipboard()

function handleShare() {
  const url = new URL(window.location.href)
  const lastSearch = localStorage.getItem(STORAGE_KEY)
  if (!url.search && lastSearch)
    url.search = lastSearch

  copy(url.toString())
}

function handleReset() {
  // eslint-disable-next-line no-alert
  if (confirm('Reset all settings? It can NOT be undone.')) {
    props.store.inputHTML.value = defaultHTML
    props.store.customConfigRaw.value = defaultConfigRaw
    props.store.options.value.transformHtml = false
    props.store.customCSS.value = defaultCSS
  }
}
</script>

<template>
  <ReplHeader name="UnoCSS Playground">
    <template #left>
      <div flex="~ items-center">
        <div flex items-center gap-2>
          <img src="/icon-gray.svg" w-4 h-4 alt="">
          <div text-sm>
            UnoCSS Playground
          </div>
        </div>
        <SelectVersion />
      </div>
    </template>
    <template #right>
      <div class="text-sm md:text-base flex flex-auto items-center justify-end flex-nowrap gap-1">
        <button
          :class="copied ? 'i-ri-checkbox-circle-line text-green' : 'i-ri-share-line'"
          icon-btn
          title="Share Link"
          @click="handleShare"
        />
        <button
          i-ri-eraser-line
          icon-btn
          title="Reset To Default"
          @click="handleReset"
        />
        <a
          i-ri-file-list-3-line icon-btn
          href="https://unocss.dev/"
          target="_blank"
          title="Documentations"
        />
        <a
          i-ri-search-line icon-btn
          href="https://unocss.dev/interactive/"
          target="_blank"
          title="Interactive Docs"
        />
        <a
          i-ri-github-line icon-btn
          href="https://github.com/unocss/unocss"
          target="_blank"
          title="GitHub"
        />
        <button
          i-ri-sun-line
          dark:i-ri-moon-line
          icon-btn
          title="Toggle Color Mode"
          @click="emit('toggleDark')"
        />
      </div>
    </template>
  </ReplHeader>
</template>
