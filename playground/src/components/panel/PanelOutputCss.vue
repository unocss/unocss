<script lang='ts' setup>
import { Pane } from 'splitpanes'
import { isCSSPrettify } from '../../composables/prettier'
import SelectLayers from '../SelectLayers.vue'

defineProps<{ index: number }>()
</script>

<template>
  <Pane :min-size="titleHeightPercent" :size="panelSizes[index]" flex flex-col>
    <TitleBar title="Output CSS" @title-click="togglePanel(index)">
      <template #before>
        <div
          class="flex-shrink-0 i-ri-arrow-right-s-line transition-transform transform"
          :class="isCollapsed(index) ? '' : 'rotate-90'"
        />
      </template>
      <div
        flex justify-end items-center w-full h-full
        gap2 transition duration-400
        :class="isCollapsed(index) ? 'op0' : ''"
        un-children="inline-flex items-center cursor-pointer gap1"
      >
        <SelectLayers />
        <label>
          <input v-model="isCSSPrettify" type="checkbox">
          <span text-sm>Prettify</span>
        </label>
      </div>
    </TitleBar>
    <CodeMirror
      :model-value="cssFormatted" flex-auto mode="css" border="l main" class="scrolls"
      :read-only="true"
    />
  </Pane>
</template>
