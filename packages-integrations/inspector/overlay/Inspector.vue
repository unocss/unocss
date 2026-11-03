<script setup lang="ts">
import type { TabPanel } from './types'
import { computed, watch } from 'vue'
import { getBoxModel } from './composables/box-model'
import { useSelection } from './composables/selection'
import ElementInfo from './ElementInfo.vue'
import { round } from './utils'

defineProps<{ panels?: TabPanel[] }>()
const modelValueElement = defineModel<HTMLElement | null>({ default: null })
const { selectedElement, tracking, isSelecting, isDraggingControl, controlPosition, startSelecting, stopSelecting, startControlDrag } = useSelection()
const highlightStyle = computed(() => {
  tracking()
  return selectedElement.value ? getBoxModel(selectedElement.value) : undefined
})
watch(selectedElement, value => modelValueElement.value = value)
</script>

<template>
  <div id="__uno-inspector">
    <!-- 控制按钮 -->
    <div
      class="uno-inspect-controls p-1 cursor-move select-none"
      :class="{ 'cursor-grabbing': isDraggingControl }"
      :style="{
        position: 'fixed',
        top: `${controlPosition.y}px`,
        left: `${controlPosition.x}px`,
        zIndex: '10002',
      }"
      @mousedown="startControlDrag"
    >
      <button class="border-none bg-transparent cursor-move" aria-label="Select an element (Cmd/Ctrl+U)">
        <div text-xl i-catppuccin:unocss />
      </button>
    </div>

    <div v-if="highlightStyle" class="uno-inspect-controls-overlay fixed pointer-events-none font-dm">
      <!-- Margin 层 -->
      <div
        v-if="highlightStyle.margin && highlightStyle.padding"
        b="~ dashed inspect-margin/50"
        class="rd-md bg-inspect-margin/25 overflow-hidden transition-all duration-100 relative"
        :style="{
          position: 'fixed',
          top: `${highlightStyle.containerTop}px`,
          left: `${highlightStyle.containerLeft}px`,
          width: `${highlightStyle.containerWidth}px`,
          height: `${highlightStyle.containerHeight}px`,
          pointerEvents: 'none',
        }"
      >
        <!-- Margin 数值标签 -->
        <div class="absolute text-10px font-medium text-inspect-margin inset-0 pointer-events-none">
          <!-- Margin Top -->
          <div
            v-if="highlightStyle.margin.top > 0"
            class="absolute"
            :style="{
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
            }"
          >
            mt-{{ round(highlightStyle.margin.top / 4) }}
          </div>
          <!-- Margin Right -->
          <div
            v-if="highlightStyle.margin.right > 0"
            class="absolute"
            :style="{
              top: '50%',
              right: `0`,
              transform: 'translateY(-50%)',
            }"
          >
            mr-{{ round(highlightStyle.margin.right / 4) }}
          </div>
          <!-- Margin Bottom -->
          <div
            v-if="highlightStyle.margin.bottom > 0"
            class="absolute"
            :style="{
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
            }"
          >
            mb-{{ round(highlightStyle.margin.bottom / 4) }}
          </div>
          <!-- Margin Left -->
          <div
            v-if="highlightStyle.margin.left > 0"
            class="absolute"
            :style="{
              top: '50%',
              left: '0',
              transform: 'translateY(-50%)',
            }"
          >
            ml-{{ round(highlightStyle.margin.left / 4) }}
          </div>
        </div>

        <div
          class="absolute bg-inspect-padding/30 transition-all duration-100 relative"
          :style="{
            top: `${highlightStyle.margin.top + highlightStyle.border.top}px`,
            left: `${highlightStyle.margin.left + highlightStyle.border.left}px`,
            width: `${highlightStyle.paddingWidth}px`,
            height: `${highlightStyle.paddingHeight}px`,
          }"
        >
          <!-- Padding 数值标签 -->
          <div class="absolute text-10px font-medium inset-0 text-inspect-padding pointer-events-none">
            <!-- Padding Top -->
            <div
              v-if="highlightStyle.padding.top > 0"
              class="absolute"
              :style="{
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
              }"
            >
              pt-{{ round(highlightStyle.padding.top / 4) }}
            </div>
            <!-- Padding Right -->
            <div
              v-if="highlightStyle.padding.right > 0"
              class="absolute"
              :style="{
                top: '50%',
                right: '0',
                transform: 'translateY(-50%)',
              }"
            >
              pr-{{ round(highlightStyle.padding.right / 4) }}
            </div>
            <!-- Padding Bottom -->
            <div
              v-if="highlightStyle.padding.bottom > 0"
              class="absolute"
              :style="{
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
              }"
            >
              pb-{{ round(highlightStyle.padding.bottom / 4) }}
            </div>
            <!-- Padding Left -->
            <div
              v-if="highlightStyle.padding.left > 0"
              class="absolute"
              :style="{
                top: '50%',
                left: '0',
                transform: 'translateY(-50%)',
              }"
            >
              pl-{{ round(highlightStyle.padding.left / 4) }}
            </div>
          </div>

          <!-- Content 层 -->
          <div
            class="absolute bg-inspect-content/15 transition-all duration-100"
            :style="{
              top: `${highlightStyle.padding.top}px`,
              left: `${highlightStyle.padding.left}px`,
              width: `${highlightStyle.contentWidth}px`,
              height: `${highlightStyle.contentHeight}px`,
            }"
          />
        </div>
      </div>
    </div>

    <!-- ElementInfo 组件 -->
    <ElementInfo
      v-if="selectedElement"
      :is-selected="!isSelecting"
      :action="{ start: startSelecting, stop: stopSelecting }"
      :user-panels="panels"
    />
  </div>
</template>

<style scoped>
.uno-inspect-controls {
  position: relative;

  &::before {
    content: '';
    display: block;
    position: absolute;
    width: 200%;
    height: 200%;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    background: linear-gradient(to bottom right, #c5c5c5, #444444);
    filter: blur(30px);
    z-index: -1;
    transition: all 0.3s ease;
    opacity: 0.72;
    animation: rotate-0360 4s linear infinite;
  }
}

@keyframes rotate-0360 {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.uno-inspect-controls:hover {
  &::before {
    opacity: 0.2;
  }
}
</style>
