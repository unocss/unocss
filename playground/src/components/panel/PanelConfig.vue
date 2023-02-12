<script lang='ts' setup>
// @ts-expect-error missing types
import { Pane } from 'splitpanes'
import { customConfigRaw } from '../../composables/url'

if (!customConfigRaw.value)
  customConfigRaw.value = defaultConfigRaw
</script>

<template>
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
</template>
