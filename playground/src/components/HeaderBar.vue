<script lang='ts' setup>
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
    inputHTML.value = defaultHTML
    customConfigRaw.value = defaultConfigRaw
    options.value.transform = false
    customCSS.value = defaultCSS
  }
}
</script>

<template>
  <div
    class="flex items-center px-2 op-60 bg-gray/10"
    border="l t gray-400/20" w-full
  >
    <div flex items-center gap-2>
      <img src="/icon-gray.svg" w-4 h-4alt="">
      <div text-sm>
        UnoCSS Playground
      </div>
      <div text-xs op50>
        v{{ version }}
      </div>
    </div>

    <div class="pl-1 ml-auto space-x-2 text-sm md:text-base flex items-center flex-nowrap">
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
      <button
        i-ri-device-line
        icon-btn
        title="Responsive"
        @click="options.responsive = !options.responsive"
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
        @click="toggleDark()"
      />
    </div>
  </div>
</template>
