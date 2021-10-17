<script setup lang="ts">
// @ts-ignore
import { Splitpanes, Pane } from 'splitpanes'
import { isDark } from '../logics/dark'
import { inputHTML, output, init } from '../logics/uno'

const iframeData = reactive({
  css: computed(() => output.value.css),
  html: inputHTML,
})
</script>

<template>
  <Splitpanes h-screen w-screen>
    <Pane>
      <preview-box
        v-show="init"
        v-bind="iframeData"
        :dark="isDark"
        h-full
      />
    </Pane>
    <Pane>
      <Editor />
    </Pane>
  </Splitpanes>
</template>
