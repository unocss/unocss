<script setup lang="ts">
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
import { isDark } from '../logics/dark'
import { customConfigError, customConfigRaw, getHint, inputHTML, output, transformedHTML } from '../logics/uno'
import { defaultConfigRaw, defaultHTML } from '../defaults'
import { options } from '../logics/url'
import { version } from '../../../package.json'
import { useCSSPrettify, useHTMLPrettify, useJSPrettify } from '../../../packages/inspector/client/composables/usePrettify'

const panel = ref()
const loading = ref(true)
const TITLE_HEIGHT = 34
const { height: vh } = useElementSize(panel)
const titleHeightPercent = computed(() => TITLE_HEIGHT / vh.value * 100)

const getInitialPanelSizes = (percent: number): number[] => {
  return [
    100 - percent * 2,
    percent,
    percent,
  ]
}

if (!inputHTML.value)
  inputHTML.value = defaultHTML
if (!customConfigRaw.value)
  customConfigRaw.value = defaultConfigRaw

const panelSizes = useLocalStorage<number[]>(
  'unocss-panel-sizes',
  getInitialPanelSizes(titleHeightPercent.value),
  { listenToStorageChanges: false },
)

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

const isHtmlPrettify = ref(false)
const htmlFormatted = useHTMLPrettify(options.value.transform ? transformedHTML : inputHTML, isHtmlPrettify)

const isCSSPrettify = ref(false)
const cssFormatted = useCSSPrettify(computed(() => output.value?.css), isCSSPrettify)

const isJsPrettify = ref(false)
const jsFormatted = useJSPrettify(customConfigRaw, isJsPrettify)

watch(
  titleHeightPercent,
  (value: number) => {
    panelSizes.value = getInitialPanelSizes(value)
  },
)

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
          <div flex items-center gap-2>
            <img src="/icon.svg" w-4 h-4alt="">
            <div hidden md:block>
              unocss
            </div>
            <div text-sm op50>
              v{{ version }}
            </div>
          </div>

          <div class="pl-1 ml-auto space-x-2 text-sm md:text-base flex items-center flex-nowrap">
            <button
              i-mdi-responsive
              class="icon-btn"
              title="Responsive"
              @click="options.responsive = !options.responsive"
            />
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
        </div>
        <TitleBar title="HTML" w-full relative>
          <template #before>
            <div
              class="flex-shrink-0 i-carbon-chevron-right mr-1 transition-transform transform"
              :class="isCollapsed(0) ? '' : 'rotate-90'"
              @click="togglePanel(0)"
            />
          </template>
          <div
            class="flex justify-end items-center w-full space-x-2"
            un-children="inline-flex items-center cursor-pointer gap-1"
          >
            <label>
              <input v-model="options.transform" type="checkbox">
              Transform
            </label>
            <label>
              <input v-model="isHtmlPrettify" type="checkbox">
              Prettify
            </label>
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
        :model-value="htmlFormatted"
        @update:model-value="isHtmlPrettify = false; inputHTML = $event"
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
        <div
          class="flex justify-end items-center w-full space-x-2"
          un-children="inline-flex items-center cursor-pointer gap-1"
        >
          <label>
            <input v-model="isCSSPrettify" type="checkbox">
            Prettify
          </label>
        </div>
      </TitleBar>
      <CodeMirror
        :model-value="cssFormatted"
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
        <div
          class="flex justify-end items-center w-full space-x-2"
          un-children="inline-flex items-center cursor-pointer gap-1"
        >
          <label>
            <input v-model="isJsPrettify" type="checkbox">
            Prettify
          </label>
        </div>
      </TitleBar>
      <CodeMirror
        flex-auto
        mode="javascript"
        border="l gray-400/20"
        class="scrolls"
        :model-value="jsFormatted"
        @update:model-value="isJsPrettify = false; customConfigRaw = $event"
      />
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
