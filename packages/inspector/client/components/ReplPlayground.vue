<script setup lang="ts">
import { fetchRepl } from '../composables/fetch'
import { useScrollStyle } from '../composables/useScrollStyle'

const status = ref(null)
const style = useScrollStyle(status, 'rpel-scrolls')

const input = useLocalStorage(
  'unocss:inspector:repl',
  '<div class="text-sm hover:text-red">\nHello World\n</div>',
)

const isSafelistIncluded = useStorage('unocss-inspector-safelist', false)
const { data: result } = fetchRepl(input, isSafelistIncluded)
</script>

<template>
  <div h-full grid="~ rows-[max-content_1fr]" of-hidden>
    <StatusBar ref="status">
      <div>
        REPL Playground
      </div>
      <div op60>
        Edit your code below to test and play UnoCSS's matching and generating.
      </div>
    </StatusBar>
    <TitleBar border="b gray-400/20" title="">
      <label>
        <input v-model="isSafelistIncluded" type="checkbox">
        Include safelist
      </label>
    </TitleBar>
    <div h-full of-hidden grid grid-cols-2>
      <CodeMirror
        v-model="input"
        mode="html"
        :matched="result?.matched || []"
        class="scrolls rpel-scrolls"
        :style="style"
      />
      <CodeMirror
        b-l
        b-main
        :model-value="result?.css || '/* empty */'"
        :read-only="true"
        mode="css"
        class="scrolls rpel-scrolls"
        :style="style"
      />
    </div>
  </div>
</template>
