<script setup lang="ts">
import { fetchRepl } from '../composables/fetch'

const input = useStorage(
  'unocss:inspector:repl',
  '<div class="text-sm hover:text-red">\nHello World\n</div>',
)

const { data: result } = fetchRepl(input)
</script>

<template>
  <div h-full grid="~ rows-[max-content,1fr]" of-hidden>
    <div
      bg-gray4:10
      p-5
      b="b main"
      text="sm gray5"
    >
      <div font-bold>
        REPL Playground
      </div>
      <div>
        Edit your code below to test and play UnoCSS's matching and generating.
      </div>
    </div>
    <div h-full of-hidden grid grid-cols-2>
      <CodeMirror
        v-model="input"
        h-full
        mode="html"
        :matched="result?.matched || []"
      />
      <CodeMirror
        h-full
        b-l
        b-main
        :model-value="result?.css || '/* empty */'"
        :read-only="true"
        mode="css"
      />
    </div>
  </div>
</template>
