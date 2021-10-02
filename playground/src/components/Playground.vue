<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
import { createGenerator } from '../../../src/generator'
import { presetAttributify, presetDefault } from '../../../src'

const generator = createGenerator({
  presets: [
    presetAttributify,
    presetDefault,
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
  <div class="font-mono flex w-full gap-2 px-10 py-3 text-gray-400">
    <textarea
      v-model="input"
      spellcheck="false"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      w="1/2"
      class="h-40 text-off font-mono rounded p-2 bg-transparent text-inherit border border-gray-400/10 outline-none"
    />
    <textarea
      readonly
      :value="formatted"
      placeholder="No result"
      spellcheck="false"
      autocorrect="off"
      autocapitalize="off"
      autocomplete="off"
      w="1/2"
      class="h-40 text-sm font-mono rounded p-2 bg-transparent text-inherit border border-gray-400/10 outline-none"
    />
  </div>
</template>
