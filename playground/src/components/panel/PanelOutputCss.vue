<script lang='ts' setup>
// @ts-expect-error missing types
import { Pane } from 'splitpanes'
import { isCSSPrettify, showPreflights } from '../../composables/prettier'

defineProps<{ index: number }>()
</script>

<template>
  <Pane :min-size="titleHeightPercent" :size="panelSizes[index]" flex flex-col min-h-30px>
    <TitleBar title="Output CSS" @title-click="togglePanel(index)">
      <template #before>
        <div
          class="flex-shrink-0 i-ri-arrow-right-s-line mr-1 transition-transform transform"
          :class="isCollapsed(index) ? '' : 'rotate-90'"
        />
      </template>
      <div
        flex justify-end items-center w-full gap2 transition duration-400 :class="isCollapsed(index) ? 'op0' : ''"
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
      :model-value="cssFormatted" flex-auto mode="css" border="l gray-400/20" class="scrolls"
      :read-only="true"
    />
  </Pane>
</template>
