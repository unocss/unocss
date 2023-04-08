<script lang='ts' setup>
// @ts-expect-error missing types
import { Pane } from 'splitpanes'
import { customCSS } from '../../composables/url'

defineProps<{ index: number }>()
</script>

<template>
  <Pane :min-size="titleHeightPercent" :size="panelSizes[index]" flex flex-col>
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
          flex justify-end items-center w-full gap2
          transition duration-400
          :class="isCollapsed(index) ? 'op0' : ''"
          un-children="inline-flex items-center cursor-pointer gap-1"
        >
          <div w-1px h-28px my--1 bg-gray:20 />
          <button
            i-ri-mist-line icon-btn
            title="Format"
            @click="formatCSS()"
          />
        </div>
      </TitleBar>
    </div>
    <CodeMirror v-model="customCSS" flex-auto mode="css" border="l gray-400/20" class="scrolls" />
  </Pane>
</template>
