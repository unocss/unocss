<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { createGenerator } from '../../../src/generator'
import { presetAttributify } from '../../../src/presets/attributify'
import { presetDefault } from '../../../src/presets/default'

const generator = createGenerator({
  presets: [
    presetAttributify(),
    presetDefault(),
  ],
})

const input = ref('<div class="sm:dark:!text-red" bg="hover:red" />')
const output = asyncComputed(() => generator(input.value))
const formatted = computed(() => prettier.format(output.value || '', {
  parser: 'css',
  plugins: [parserCSS],
}))
</script>

<template>
  <div
    class="font-mono flex w-full gap-2 px-10 py-3"
    text="sm gray-600 dark:gray-200"
  >
    <CodeMirror
      v-model="input"
      mode="htmlmixed"
      h="90"
      w="1/2"
      overflow="hidden"
      mw-border="~ gray-400/10 rounded"
    />
    <CodeMirror
      v-model="formatted"
      mode="css"
      h="90"
      w="1/2"
      overflow="hidden"
      mw-border="~ gray-400/10 rounded"
      :read-only="true"
    />
  </div>
</template>
