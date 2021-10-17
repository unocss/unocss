<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
// @ts-ignore
import { Splitpanes, Pane } from 'splitpanes'
import { isDark } from '../logics/dark'
import { customConfigRaw, inputHTML, output } from '../logics/uno'
import { defaultConfigRaw, defaultHTML } from '../defaults'

const TITLE_HEIGHT = 34
const { height: vh } = useWindowSize()
const titleHeightPercent = computed(() => TITLE_HEIGHT / vh.value * 100)

if (!inputHTML.value)
  inputHTML.value = defaultHTML
if (!customConfigRaw.value)
  customConfigRaw.value = defaultConfigRaw

const panel = ref()

const panelSizes = useStorage<number[]>('unocss-panel-sizes', [
  100 - titleHeightPercent.value * 2,
  titleHeightPercent.value,
  titleHeightPercent.value,
])
function handleResize(event: ({ size: number })[]) {
  panelSizes.value = event.map(({ size }) => size)
}
function togglePanel(index: number) {
  if (panelSizes.value[index] <= titleHeightPercent.value)
    panelSizes.value[index] = 100 / panelSizes.value.length
  else
    panelSizes.value[index] = titleHeightPercent.value

  normalizePanels()
}

function normalizePanels() {
  const ignoredIndex: number[] = []
  let orignalSum = 0
  let ignoredSum = 0

  panelSizes.value.forEach((v, idx) => {
    if (v <= titleHeightPercent.value) {
      ignoredIndex.push(idx)
      ignoredSum += v
    }
    else {
      orignalSum += v
    }
  })

  const resize = (100 - ignoredSum) / orignalSum

  panelSizes.value.forEach((v, idx) => {
    if (ignoredIndex.includes(idx))
      return
    panelSizes.value[idx] *= resize
  })
}

const isPrettify = ref(false)
const formatted = computed(() => {
  if (!isPrettify.value)
    return output.value?.css || ''
  return prettier.format(output.value?.css || '', {
    parser: 'css',
    plugins: [parserCSS],
  })
})
</script>

<template>
  <Splitpanes ref="panel" horizontal h-screen @resize="handleResize">
    <Pane :min-size="titleHeightPercent" :size="panelSizes[0]" flex flex-col>
      <TitleBar title="HTML">
        <template #before>
          <div class="i-carbon-chevron-right mr-1 transform rotate-90" @click="togglePanel(0)"></div>
        </template>
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
    <Pane :min-size="titleHeightPercent" :size="panelSizes[1]" flex flex-col>
      <TitleBar title="Output CSS">
        <template #before>
          <div class="i-carbon-chevron-right mr-1" @click="togglePanel(1)"></div>
        </template>
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
    <Pane :min-size="titleHeightPercent" :size="panelSizes[2]" flex flex-col>
      <TitleBar title="Config">
        <template #before>
          <div class="i-carbon-chevron-right mr-1" @click="togglePanel(2)"></div>
        </template>
      </TitleBar>
      <CodeMirror v-model="customConfigRaw" flex-auto mode="javascript" border="l gray-400/20" />
    </Pane>
  </Splitpanes>
</template>

<style>
.highlighted {
  border-bottom: 1px dashed currentColor;
}
</style>
