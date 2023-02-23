<script lang='ts' setup>
// @ts-expect-error missing types
import { Pane } from 'splitpanes'
import { isCSSPrettify, showPreflights } from '../../composables/prettier'
import { customCSS } from '../../composables/url'

const [isCustomCSS, toggleCustomCSS] = useToggle(false)
</script>

<template>
  <Pane :min-size="titleHeightPercent" :size="panelSizes[2]" flex flex-col min-h-28px>
    <TitleBar :title="isCustomCSS ? 'Custom CSS' : 'Output CSS'" @title-click="togglePanel(2)">
      <template #before>
        <div
          class="flex-shrink-0 i-ri-arrow-right-s-line mr-1 transition-transform transform"
          :class="isCollapsed(2) ? '' : 'rotate-90'"
        />
      </template>
      <div
        flex justify-end items-center w-full gap2 transition duration-400 :class="isCollapsed(2) ? 'op0' : ''"
        un-children="inline-flex items-center cursor-pointer gap1"
      >
        <button i-ri:arrow-left-right-line title="Custom CSS" @click="toggleCustomCSS()" />
        <label v-if="!isCustomCSS">
          <input v-model="showPreflights" type="checkbox">
          <span text-sm>Preflights</span>
        </label>
        <label v-if="!isCustomCSS">
          <input v-model="isCSSPrettify" type="checkbox">
          <span text-sm>Prettify</span>
        </label>
        <button v-else i-ri-mist-line icon-btn title="Format" @click="formatCSS()" />
      </div>
    </TitleBar>
    <CodeMirror v-if="isCustomCSS" v-model="customCSS" flex-auto mode="css" border="l gray-400/20" class="scrolls" />
    <CodeMirror
      v-else :model-value="cssFormatted" flex-auto mode="css" border="l gray-400/20" class="scrolls"
      :read-only="true"
    />
  </Pane>
</template>
