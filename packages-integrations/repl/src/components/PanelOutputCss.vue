<script setup lang="ts">
import { Pane } from 'splitpanes'
import { inject } from 'vue'
import { UnoCodeMirror } from '../codemirror'
import { useCssOutput } from '../composables/useCssOutput'
import { usePanelLayoutContext } from '../composables/usePanelLayout'
import { UnoMonaco } from '../monaco'
import SelectLayers from './SelectLayers.vue'
import TitleBar from './TitleBar.vue'

defineProps<{ index: number }>()

const panel = usePanelLayoutContext()
const cssOutput = useCssOutput()
const theme = inject<import('vue').Ref<'dark' | 'light'>>('repl-theme')!
const editorType = inject<import('vue').Ref<'monaco' | 'codemirror'>>('repl-editor-type')!
</script>

<template>
  <Pane :min-size="panel.titleHeightPercent.value" :size="panel.panelSizes.value[index]" flex flex-col>
    <TitleBar title="Output CSS" @title-click="panel.togglePanel(index)">
      <template #before>
        <div
          class="flex-shrink-0 i-ri-arrow-right-s-line transition-transform transform"
          :class="panel.isCollapsed(index) ? '' : 'rotate-90'"
        />
      </template>
      <div
        flex justify-end items-center w-full h-full
        gap2 transition duration-400
        :class="panel.isCollapsed(index) ? 'op0' : ''"
        un-children="inline-flex items-center cursor-pointer gap1"
      >
        <SelectLayers />
        <label>
          <input v-model="cssOutput.isCSSPrettify.value" type="checkbox">
          <span text-sm>Prettify</span>
        </label>
      </div>
    </TitleBar>
    <UnoMonaco
      v-if="editorType === 'monaco'"
      :model-value="cssOutput.cssFormatted.value || ''"
      language="css"
      :theme="theme"
      :read-only="true"
      :register-providers="false"
      flex-auto
      border="l main"
    />
    <UnoCodeMirror
      v-else
      :model-value="cssOutput.cssFormatted.value || ''"
      language="css"
      :theme="theme"
      :read-only="true"
      flex-auto
      border="l main"
    />
  </Pane>
</template>
