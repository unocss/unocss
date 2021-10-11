<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { createGenerator } from 'unocss'
import config from '../../unocss.config'

const uno = createGenerator(config)
const input = useStorage('unocss-input', '<div class="sm:dark:!text-red" bg="hover:red" />')
const output = asyncComputed(() => uno.generate(input.value), { css: '', matched: new Set<string>() })
const formatted = computed(() => prettier.format(output.value?.css || '', {
  parser: 'css',
  plugins: [parserCSS],
}))
</script>

<template>
  <div p="x-10">
    <div
      flex="~ col gap-2"
      w="full"
      class="font-mono py-3"
      text="sm gray-600 dark:gray-200"
    >
      <CodeMirror
        v-model="input"
        mode="htmlmixed"
        h="90"
        overflow="hidden"
        un-border="~ gray-400/10 rounded"
        :matched="output.matched"
      />
      <CodeMirror
        v-model="formatted"
        mode="css"
        h="90"
        overflow="hidden"
        un-border="~ gray-400/10 rounded"
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
