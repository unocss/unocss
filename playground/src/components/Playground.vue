<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { createGenerator } from 'unocss'
import config from '../../unocss.config'
import { isDark } from '../logics/dark'
// @ts-ignore
import defaultInput from '../default.txt?raw'

const isPrettify = ref(false)

const uno = createGenerator(config)
const input = useStorage('unocss-input', defaultInput)
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
    <div grid="~ rows-[1fr,50px]">
      <preview-box h-full v-bind="iframeData" :dark="isDark" />
      <div
        style="background-color: var(--cm-background)"
        border="t gray-400/20"
        text="gray-400/80"
        px-3
        select-none
        flex
      >
        <div my-auto>
          <label>
            <input v-model="isDark" type="checkbox" />
            Dark
          </label>
          <label>
            <input v-model="isPrettify" type="checkbox" />
            Prettify
          </label>
        </div>
      </div>
    </div>
    <div
      grid="~ rows-[1fr,1fr]"
      h-screen
      overflow-hidden
      font-mono
      text="sm gray-600 dark:gray-200"
    >
      <CodeMirror
        v-model="input"
        relative
        h-50vh
        mode="htmlmixed"
        border="l gray-400/20"
        :matched="output.matched"
      />
      <CodeMirror
        v-model="formatted"
        relative
        h-50vh
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
