<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
import { isDark } from '../logics/dark'
import { customConfigError, customConfigRaw, inputHTML, output } from '../logics/uno'
import { defaultConfigRaw, defaultHTML } from '../defaults'
import { options } from '../logics/url'
import { version } from '../../../package.json'

const loading = ref(true)
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
], localStorage, { listenToStorageChanges: false })

function handleResize(event: ({ size: number })[]) {
  panelSizes.value = event.map(({ size }) => size)
}
function isCollapsed(index: number) {
  return panelSizes.value[index] <= titleHeightPercent.value + 3
}
function togglePanel(index: number) {
  if (isCollapsed(index))
    panelSizes.value[index] = 100 / panelSizes.value.length
  else
    panelSizes.value[index] = titleHeightPercent.value

  normalizePanels()
}
function normalizePanels() {
  const ignoredIndex: number[] = []
  let originalSum = 0
  let ignoredSum = 0

  panelSizes.value.forEach((v, idx) => {
    if (v <= titleHeightPercent.value) {
      ignoredIndex.push(idx)
      ignoredSum += v
    }
    else {
      originalSum += v
    }
  })

  const resize = (100 - ignoredSum) / originalSum

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
  try {
    return prettier.format(output.value?.css || '', {
      parser: 'css',
      plugins: [parserCSS],
    })
  }
  catch (e: any) {
    console.error(e)
    return `/* Error on prettifying: ${e.message} */\n${output.value?.css || ''}`
  }
})

onMounted(() => {
  // prevent init transition
  setTimeout(() => {
    loading.value = false
  }, 200)
})
</script>

<template>
  <Splitpanes ref="panel" :class="{loading}" horizontal h-screen @resize="handleResize">
    <Pane :min-size="titleHeightPercent" :size="panelSizes[0]" flex flex-col>
      <TitleBar title="HTML">
        <template #before>
          <div
            class="i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(0) ? '' : 'rotate-90'"
            @click="togglePanel(0)"
          />
        </template>
        <label>
          <input v-model="options.strict" type="checkbox">
          Strict
        </label>
        <div flex-auto />
        <div text-sm op50>
          v{{ version }}
        </div>
        <a
          i-carbon-logo-github
          text-xl
          op75
          hover:op100
          href="https://github.com/antfu/unocss"
          target="_blank"
        />
        <button
          i-carbon-sun
          dark-i-carbon-moon
          text-xl
          op75
          hover:op100
          @click="isDark = !isDark"
        />
      </TitleBar>
      <CodeMirror
        v-model="inputHTML"
        flex-auto
        mode="htmlmixed"
        border="l gray-400/20"
        :matched="output?.matched || new Set()"
      />
    </Pane>
    <Pane :min-size="titleHeightPercent" :size="panelSizes[1]" flex flex-col>
      <TitleBar title="Output CSS">
        <template #before>
          <div
            class="i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(1) ? '' : 'rotate-90'"
            @click="togglePanel(1)"
          />
        </template>
        <label>
          <input v-model="isPrettify" type="checkbox">
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
    <Pane :min-size="titleHeightPercent" :size="panelSizes[2]" flex flex-col relative>
      <TitleBar title="Config">
        <template #before>
          <div
            class="i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(2) ? '' : 'rotate-90'"
            @click="togglePanel(2)"
          />
        </template>
      </TitleBar>
      <CodeMirror v-model="customConfigRaw" flex-auto mode="javascript" border="l gray-400/20" />
      <div
        v-if="customConfigError"
        absolute
        left-0
        right-0
        bottom-0
        p="x-2 y-1"
        bg="red-400/20"
        text="red-400 sm"
      >
        {{ customConfigError.toString() }}
      </div>
    </Pane>
  </Splitpanes>
</template>

<style>
.splitpanes.loading .splitpanes__pane {
  transition: none !important;
}
</style>
