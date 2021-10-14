<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { isDark } from '../logics/dark'
// @ts-ignore
import defaultInput from '../default.txt?raw'
import { uno } from '../logics/uno'

const isPrettify = ref(false)

const input = useStorage('unocss-input', defaultInput)
if (!input.value)
  input.value = defaultInput
const output = asyncComputed(() => uno.generate(input.value), { css: '', matched: new Set<string>() })
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
  html: input,
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
        v-model="input"
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
    </div>
  </div>
</template>

<style>
.highlighted {
  border-bottom: 1px dashed currentColor;
}
</style>
