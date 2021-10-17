<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { isDark } from '../logics/dark'
import { customConfigRaw, inputHTML, output } from '../logics/uno'
import { defaultConfigRaw, defaultHTML } from '../defaults'

if (!inputHTML.value)
  inputHTML.value = defaultHTML
if (!customConfigRaw.value)
  customConfigRaw.value = defaultConfigRaw

const isPrettify = ref(false)

const formatted = computed(() => {
  if (!isPrettify.value)
    return output.value?.css || ''
  return prettier.format(output.value?.css || '', {
    parser: 'css',
    plugins: [parserCSS],
  })
})

const iframeData = reactive({
  css: formatted,
  html: inputHTML,
})
</script>

<template>
  <div h-screen w-screen grid="~ cols-[2fr,3fr]">
    <preview-box h-full v-bind="iframeData" :dark="isDark" />
    <div
      grid="~ rows-[40px,1fr,40px,1fr]"
      h-screen
      overflow-hidden
      text="sm gray-600 dark:gray-200"
    >
      <div
        style="background-color: var(--cm-background)"
        border="l b gray-400/20"
        text="gray-400/80"
        px-3
        select-none
        flex
        all:my-auto
      >
        <div mr-5 op-60>
          HTML
        </div>
        <label>
          <input v-model="isDark" type="checkbox" />
          Dark
        </label>
      </div>
      <CodeMirror
        v-model="inputHTML"
        relative
        font-mono
        overflow-auto
        mode="htmlmixed"
        border="l gray-400/20"
        :matched="output.matched"
      />
      <!---->
      <div
        style="background-color: var(--cm-background)"
        border="l t gray-400/20"
        text="gray-400/80"
        px-3
        select-none
        flex
        all:my-auto
      >
        <div mr-5 op-60>
          Output CSS
        </div>
        <label>
          <input v-model="isPrettify" type="checkbox" />
          Prettify
        </label>
      </div>
      <CodeMirror
        v-model="formatted"
        relative
        font-mono
        overflow-auto
        mode="css"
        border="l t gray-400/20"
        :read-only="true"
      />
      <CodeMirror
        v-model="customConfigRaw"
        relative
        font-mono
        overflow-auto
        mode="javascript"
        border="l t gray-400/20"
      />
    </div>
  </div>
</template>

<style>
.highlighted {
  border-bottom: 1px dashed currentColor;
}
</style>
