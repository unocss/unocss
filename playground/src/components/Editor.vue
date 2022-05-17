<script setup lang="ts">
import prettier from 'prettier/standalone'
import parserCSS from 'prettier/parser-postcss'
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
import { isDark } from '../logics/dark'
import { customConfigError, customConfigRaw, getHint, inputHTML, output, transformedHTML } from '../logics/uno'
import { defaultConfigRaw, defaultHTML } from '../defaults'
import { options } from '../logics/url'
import { version } from '../../../package.json'

const panel = ref()
const loading = ref(true)
const TITLE_HEIGHT = 34
const { height: vh } = useElementSize(panel)
const titleHeightPercent = computed(() => TITLE_HEIGHT / vh.value * 100)

if (!inputHTML.value)
  inputHTML.value = defaultHTML
if (!customConfigRaw.value)
  customConfigRaw.value = defaultConfigRaw

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
  <Splitpanes ref="panel" :class="{ loading }" horizontal @resize="handleResize">
    <Pane :min-size="titleHeightPercent * 2" :size="panelSizes[0]" flex flex-col min-h-68px>
      <div class="flex flex-wrap bg-$cm-background">
        <div class="flex items-center w-full px-2 op-60" border="l t gray-400/20" :style="`height:${TITLE_HEIGHT}px`">
          <img src="/icon.svg" w-4 h-4 mr-2 alt="">
          <div hidden md:block>
            unocss
          </div>
          <div class="pl-1 ml-auto space-x-2 text-sm md:text-base flex flex-nowrap">
            <label inline-flex items-center>
              <input v-model="options.strict" type="checkbox" class="mr-1">
              Strict
            </label>
            <label inline-flex items-center>
              <input v-model="options.transform" type="checkbox" class="mr-1">
              Transform
            </label>
            <label inline-flex items-center>
              <input v-model="options.responsive" type="checkbox" class="mr-1">
              Responsive
            </label>
          </div>
        </div>
        <TitleBar title="HTML" w-full>
          <template #before>
            <div
              class="flex-shrink-0 i-carbon-chevron-right mr-1 transition-transform transform"
              :class="isCollapsed(0) ? '' : 'rotate-90'"
              @click="togglePanel(0)"
            />
          </template>
          <div class="flex flex-row w-full space-x-1">
            <div flex-auto />
            <div text-sm op50>
              v{{ version }}
            </div>
            <a
              i-carbon-document-attachment
              class="icon-btn"
              href="https://uno.antfu.me"
              target="_blank"
              title="Interactive Docs"
            />
            <a
              i-carbon-logo-github
              class="icon-btn"
              href="https://github.com/unocss/unocss"
              target="_blank"
              title="GitHub"
            />
            <button
              i-carbon-sun
              dark-i-carbon-moon
              class="icon-btn"
              @click="isDark = !isDark"
            />
          </div>
        </TitleBar>
      </div>
      <CodeMirror
        flex-auto
        mode="htmlmixed"
        class="scrolls border-(l gray-400/20)"
        :matched="output?.matched || new Set()"
        :get-hint="getHint"
        :read-only="options.transform"
        :model-value="options.transform ? transformedHTML : inputHTML"
        @update:model-value="inputHTML = $event"
      />
    </Pane>
    <Pane :min-size="titleHeightPercent" :size="panelSizes[1]" flex flex-col min-h-34px>
      <TitleBar title="Output CSS">
        <template #before>
          <div
            class="flex-shrink-0 i-carbon-chevron-right mr-1 transition-transform transform"
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
        class="scrolls"
        :read-only="true"
      />
    </Pane>
    <Pane :min-size="titleHeightPercent" :size="panelSizes[2]" flex flex-col min-h-34px relative>
      <TitleBar title="Config">
        <template #before>
          <div
            class="flex-shrink-0 i-carbon-chevron-right mr-1 transition-transform transform"
            :class="isCollapsed(2) ? '' : 'rotate-90'"
            @click="togglePanel(2)"
          />
        </template>
      </TitleBar>
      <CodeMirror v-model="customConfigRaw" flex-auto mode="javascript" border="l gray-400/20" class="scrolls" />
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
.icon-btn {
  @apply text-xl op75 hover:op100;
}
</style>
