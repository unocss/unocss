<script lang='ts' setup>
// @ts-expect-error missing types
import { Pane } from 'splitpanes'
import { customCSS } from '../../composables/url'

defineProps<{ index: number }>()

const computedCustomCSS = computed({
  get: () => unref(options.value.transformCustomCSS ? transformedCSS : customCSS),
  set: (value) => {
    customCSS.value = value
  },
})

const errorBody = computed(() => {
  if (customCSSError.value) {
    const msg = customCSSError.value.message
    const match = msg.match(/^(.+)'(.+)'(.+)$/)
    if (match)
      return `${match[1]}'<a inline-block b="b dashed red4" href="https://unocss.dev/transformers/directives" target='_blank'>${match[2]}</a>'${match[3]}`
  }
  return ''
})
</script>

<template>
  <Pane :min-size="titleHeightPercent" :size="panelSizes[index]" flex flex-col relative>
    <div class="flex flex-wrap bg-$cm-background">
      <TitleBar
        title="Custom CSS" w-full relative
        @title-click="togglePanel(index)"
      >
        <template #before>
          <div
            class="flex-shrink-0 i-ri-arrow-right-s-line mr-1 transition-transform transform"
            :class="isCollapsed(index) ? '' : 'rotate-90'"
          />
        </template>
        <div
          flex justify-end items-center w-full h-full gap2
          transition duration-400
          :class="isCollapsed(index) ? 'op0' : ''"
          un-children="inline-flex items-center cursor-pointer gap-1"
        >
          <label>
            <input v-model="options.transformCustomCSS" type="checkbox">
            <span text-sm>Transform</span>
          </label>
          <div w-1px h-full my--1 bg-gray:20 />
          <button
            i-ri-mist-line icon-btn
            title="Format"
            @click="formatCSS()"
          />
        </div>
      </TitleBar>
    </div>
    <CodeMirror
      v-model="computedCustomCSS"
      :read-only="options.transformCustomCSS"
      flex-auto
      mode="css"
      border="l
      gray-400/20"
      class="scrolls"
    />
    <div
      v-if="options.transformCustomCSS && customCSSError"
      absolute
      left-0
      right-0
      bottom-0
      p="x-2 y-1"
      bg="red-400/20"
      text="red-400 sm"
      v-html="errorBody"
    />
  </Pane>
</template>
