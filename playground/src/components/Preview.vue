<script setup lang="ts">
import { isDark } from '../logics/dark'
import { inputHTML, output, init } from '../logics/uno'

const iframe = ref<HTMLIFrameElement>()

const iframeData = reactive({
  source: 'unocss-playground',
  css: computed(() => output.value?.css || ''),
  html: inputHTML,
  dark: isDark,
})

async function send() {
  iframe.value?.contentWindow?.postMessage(JSON.stringify(iframeData), location.origin)
}

watch([iframeData, iframe], send, { deep: true })
</script>

<template>
  <iframe
    v-show="init"
    ref="iframe"
    h-full
    w-full
    :class="{ dark: isDark }"
    src="/__play.html"
    @load="send"
  />
</template>
