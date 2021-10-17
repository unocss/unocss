<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
// @ts-ignore
import { Splitpanes, Pane } from 'splitpanes'
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
  <Splitpanes h-screen w-screen>
    <Pane>
      <preview-box h-full v-bind="iframeData" :dark="isDark" />
    </Pane>
    <Pane>
      <Splitpanes horizontal h-screen>
        <Pane min-size="10" flex flex-col>
          <TitleBar title="HTML">
            <label>
              <input v-model="isDark" type="checkbox" />
              Dark
            </label>
          </TitleBar>
          <CodeMirror
            v-model="inputHTML"
            flex-auto
            mode="htmlmixed"
            border="l gray-400/20"
            :matched="output.matched"
          />
        </Pane>
        <Pane min-size="10" flex flex-col>
          <TitleBar title="Output CSS">
            <label>
              <input v-model="isPrettify" type="checkbox" />
              Prettify
            </label>
          </TitleBar>
          <CodeMirror
            v-model="formatted"
            flex-auto
            mode="css"
            border="l gray-400/20"
            :read-only="true"
          />
        </Pane>
        <Pane min-size="10" flex flex-col>
          <TitleBar title="Config"></TitleBar>
          <CodeMirror
            v-model="customConfigRaw"
            flex-auto
            mode="javascript"
            border="l gray-400/20"
          />
        </Pane>
      </Splitpanes>
    </Pane>
  </Splitpanes>
</template>

<style>
.highlighted {
  border-bottom: 1px dashed currentColor;
}
</style>
