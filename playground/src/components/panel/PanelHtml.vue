<script lang='ts' setup>
import { Pane } from 'splitpanes'

defineProps<{ index: number }>()

if (!inputHTML.value)
  inputHTML.value = defaultHTML

const computedInputHTML = computed({
  get: () => unref(options.value.transformHtml ? transformedHTML : inputHTML),
  set: (value) => {
    inputHTML.value = value
  },
})
</script>

<template>
  <Pane :min-size="titleHeightPercent" :size="panelSizes[index]" flex flex-col>
    <div class="flex flex-wrap bg-$cm-background">
      <!--  <HeaderBar /> -->
      <TitleBar
        title="HTML" w-full relative
        @title-click="togglePanel(index)"
      >
        <template #before>
          <div
            class="flex-shrink-0 i-ri-arrow-right-s-line transition-transform transform"
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
            <input v-model="options.transformHtml" type="checkbox">
            <span text-sm>Transform</span>
          </label>
          <div w-1px h-full bg-gray:20 />
          <button
            i-ri-mist-line icon-btn
            title="Format"
            @click="formatHTML()"
          />
        </div>
      </TitleBar>
    </div>
    <CodeMirror
      v-model="computedInputHTML"
      flex-auto
      mode="html"
      class="scrolls border-l border-main"
      :matched="output?.matched || new Set()"
      :annotations="annotations"
      :get-hint="getHint"
      :read-only="options.transformHtml"
    />
  </Pane>
</template>
