<script setup lang="ts">
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
import { isDark } from '../logics/dark'
import { customConfigError, customConfigRaw, getHint, inputHTML, output, showPreflights, transformedHTML } from '../logics/uno'
import { defaultConfigRaw, defaultHTML } from '../defaults'
import { STORAGE_KEY, options } from '../logics/url'
import { version } from '../../../package.json'
import { useCSSPrettify, useHTMLPrettify, useJSPrettify } from '../../../packages/inspector/client/composables/usePrettify'

const { copy, copied } = useClipboard()
const panel = ref()
const loading = ref(true)
const TITLE_HEIGHT = 30
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

function handleShare() {
  const url = new URL(window.location.href)
  const lastSearch = localStorage.getItem(STORAGE_KEY)
  if (!url.search && lastSearch)
    url.search = lastSearch

  copy(url.toString())
}

function handleReset() {
  // eslint-disable-next-line no-alert
  if (confirm('Reset all settings? It can NOT be undone.')) {
    inputHTML.value = defaultHTML
    customConfigRaw.value = defaultConfigRaw
    options.value.transform = false
  }
}

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

const formatHTML = () => {
  inputHTML.value = useHTMLPrettify(options.value.transform ? transformedHTML : inputHTML).value
}
const formatConfig = () => {
  customConfigRaw.value = useJSPrettify(customConfigRaw).value
}
const isCSSPrettify = ref(false)
const cssFormatted = useCSSPrettify(
  computed(() => output.value?.getLayers(undefined,
    showPreflights.value
      ? undefined
      : ['preflights'],
  )),
  isCSSPrettify,
)

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
    <Pane :min-size="titleHeightPercent * 2" :size="panelSizes[0]" flex flex-col min-h-65px>
      <div class="flex flex-wrap bg-$cm-background">
        <div
          class="flex items-center px-2 op-60 bg-gray/10"
          border="l t gray-400/20" h-36px w-full
        >
          <div flex items-center gap-2>
            <img src="/icon-gray.svg" w-4 h-4alt="">
            <div text-sm>
              UnoCSS Playground
            </div>
            <div text-xs op50>
              v{{ version }}
            </div>
          </div>

          <div class="pl-1 ml-auto space-x-2 text-sm md:text-base flex items-center flex-nowrap">
            <button
              :class="copied ? 'i-ri-checkbox-circle-line text-green' : 'i-ri-share-line'"
              icon-btn
              title="Share Link"
              @click="handleShare"
            />
            <button
              i-ri-eraser-line
              icon-btn
              title="Reset To Default"
              @click="handleReset"
            />
            <a
              i-ri-search-line icon-btn
              href="https://uno.antfu.me"
              target="_blank"
              title="Interactive Docs"
            />
            <button
              i-ri-device-line
              icon-btn
              title="Responsive"
              @click="options.responsive = !options.responsive"
            />
            <a
              i-ri-github-line icon-btn
              href="https://github.com/unocss/unocss"
              target="_blank"
              title="GitHub"
            />
            <button
              i-ri-sun-line
              dark:i-ri-moon-line
              icon-btn
              title="Toggle Color Mode"
              @click="isDark = !isDark"
            />
          </div>
        </div>
        <TitleBar
          title="HTML" w-full relative
          @title-click="togglePanel(0)"
        >
          <template #before>
            <div
              class="flex-shrink-0 i-ri-arrow-right-s-line mr-1 transition-transform transform"
              :class="isCollapsed(0) ? '' : 'rotate-90'"
            />
          </template>
          <div
            flex justify-end items-center w-full gap2
            transition duration-400
            :class="isCollapsed(0) ? 'op0' : ''"
            un-children="inline-flex items-center cursor-pointer gap-1"
          >
            <label>
              <input v-model="options.transform" type="checkbox">
              <span text-sm>Transform</span>
            </label>
            <div w-1px h-28px my--1 bg-gray:20 />
            <button
              i-ri-mist-line icon-btn
              title="Format"
              @click="formatHTML"
            />
          </div>
        </TitleBar>
      </div>
      <CodeMirror
        flex-auto
        mode="html"
        class="scrolls border-(l gray-400/20)"
        :matched="output?.matched || new Set()"
        :get-hint="getHint"
        :read-only="options.transform"
        :model-value="options.transform ? transformedHTML : inputHTML"
        @update:model-value="inputHTML = $event"
      />
    </Pane>
    <Pane :min-size="titleHeightPercent" :size="panelSizes[1]" flex flex-col min-h-28px relative>
      <TitleBar
        title="Config"
        @title-click="togglePanel(1)"
      >
        <template #before>
          <div
            class="flex-shrink-0 i-ri-arrow-right-s-line mr-1 transition-transform transform"
            :class="isCollapsed(1) ? '' : 'rotate-90'"
          />
        </template>
        <div
          flex flex-1 justify-end items-center w-full gap2
          transition duration-400
          :class="isCollapsed(1) ? 'op0' : ''"
          un-children="inline-flex items-center cursor-pointer gap1"
        >
          <div w-1px h-28px my--1 bg-gray:20 />
          <button
            i-ri-mist-line icon-btn
            title="Format"
            @click="formatConfig"
          />
        </div>
      </TitleBar>
      <CodeMirror
        v-model="customConfigRaw"
        flex-auto
        mode="js"
        border="l gray-400/20"
        class="scrolls"
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
    <Pane :min-size="titleHeightPercent" :size="panelSizes[2]" flex flex-col min-h-28px>
      <TitleBar
        title="Output CSS"
        @title-click="togglePanel(2)"
      >
        <template #before>
          <div
            class="flex-shrink-0 i-ri-arrow-right-s-line mr-1 transition-transform transform"
            :class="isCollapsed(2) ? '' : 'rotate-90'"
          />
        </template>
        <div
          flex justify-end items-center w-full gap2
          transition duration-400
          :class="isCollapsed(2) ? 'op0' : ''"
          un-children="inline-flex items-center cursor-pointer gap1"
        >
          <label>
            <input v-model="showPreflights" type="checkbox">
            <span text-sm>Preflights</span>
          </label>
          <label>
            <input v-model="isCSSPrettify" type="checkbox">
            <span text-sm>Prettify</span>
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
  </Splitpanes>
</template>

<style>
.splitpanes.loading .splitpanes__pane {
  transition: none !important;
}
[icon-btn=""] {
  --at-apply: text-xl op75 hover:op100;
}
</style>
