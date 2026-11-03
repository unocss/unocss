<script lang='ts' setup>
import type { TabPanel } from './types'
import { useEventListener, useMouse, useToggle, useWindowSize } from '@vueuse/core'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { isTrusted } from './client-rpc'
import ServerConnection from './components/ServerConnection.vue'
import { useElement } from './composables/exports/element'
import { useTabs } from './composables/exports/tabs'
import { INSPECTOR_SEARCH_EVENT } from './composables/search'

interface Props {
  isSelected: boolean
  action: {
    start: () => void
    stop: () => void
  }
  userPanels?: TabPanel[]
}

const props = defineProps<Props>()

const { element, triggering } = useElement()

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { x: mouseX, y: mouseY } = useMouse({ type: 'client' })

const panelRef = ref<HTMLElement>()

// 拖动相关状态
const [isDragging, _toggleDragging] = useToggle(false)
const dragOffset = ref({ x: 0, y: 0 })
const dragPosition = ref({ x: 0, y: 0 })
const finalPosition = ref({ x: 0, y: 0 })

const { tabs, activeTab, slideDirection, setActiveTab } = useTabs(props.userPanels)

// 计算面板位置的辅助函数
function calculatePanelPosition(mouseX: number, mouseY: number) {
  const offsetX = 20
  const offsetY = 20
  const panelWidth = panelRef.value?.offsetWidth || 300
  const panelHeight = panelRef.value?.offsetHeight || 350
  const minMargin = 10
  const scrollTop = 0

  let left = mouseX + offsetX
  let top = mouseY + offsetY

  // 避免超出右边界
  if (left + panelWidth > windowWidth.value) {
    left = mouseX - panelWidth - offsetX
  }

  // 避免超出下边界
  if (top + panelHeight > windowHeight.value + scrollTop) {
    top = mouseY - panelHeight - offsetY
  }

  // 避免超出左边界
  if (left < minMargin) {
    left = minMargin
  }

  // 避免超出上边界
  if (top < minMargin + scrollTop) {
    top = minMargin
  }

  return { x: left, y: top - scrollTop }
}

const panelPosition = computed(() => {
  let baseX, baseY

  if (props.isSelected) {
    // 选中状态：使用拖动后的最终位置，如果正在拖动则使用当前拖动位置
    if (isDragging.value) {
      baseX = dragPosition.value.x
      baseY = dragPosition.value.y
    }
    else {
      // 使用选中时计算并固定的位置
      baseX = finalPosition.value.x
      baseY = finalPosition.value.y
    }
  }
  else {
    // 跟随鼠标状态：跟随鼠标移动，但避免超出视口
    const position = calculatePanelPosition(mouseX.value, mouseY.value)
    baseX = position.x
    baseY = position.y
  }

  return {
    position: 'fixed' as const,
    left: `${baseX}px`,
    top: `${baseY}px`,
    zIndex: '1001',
  }
})

function updateElementInfo() {
  triggering()
}

// 拖动相关函数
function startDrag(event: MouseEvent) {
  if (!props.isSelected)
    return

  const rect = (event.currentTarget as HTMLElement).closest('.uno-inspect-element-info')?.getBoundingClientRect()

  if (rect) {
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }

    // 初始化拖拽位置为当前面板位置，避免闪烁
    dragPosition.value = {
      x: rect.left,
      y: rect.top,
    }
  }

  isDragging.value = true
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  event.preventDefault()
}

function handleDrag(event: MouseEvent) {
  if (!isDragging.value)
    return

  const newX = event.clientX - dragOffset.value.x
  const newY = event.clientY - dragOffset.value.y

  // 限制在视口内
  const panelWidth = panelRef.value?.offsetWidth || 300
  const panelHeight = panelRef.value?.offsetHeight || 350 // 使用真实DOM高度，fallback到max-height
  const maxX = windowWidth.value - panelWidth
  const maxY = windowHeight.value - panelHeight

  dragPosition.value = {
    x: Math.max(0, Math.min(newX, maxX)),
    y: Math.max(0, Math.min(newY, maxY)),
  }
}

function stopDrag() {
  if (isDragging.value) {
    finalPosition.value = {
      x: dragPosition.value.x,
      y: dragPosition.value.y,
    }
  }

  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 监听元素变化，重置拖拽位置
watch(() => element.value, () => {
  if (element.value) {
    finalPosition.value = { x: 0, y: 0 }
    dragPosition.value = { x: 0, y: 0 }
    isDragging.value = false
  }
})

// 监听选中状态变化，计算并固定初始面板位置
watch(() => props.isSelected, (isSelected) => {
  if (isSelected) {
    // 立即计算面板的初始位置并固定
    const position = calculatePanelPosition(mouseX.value, mouseY.value)
    finalPosition.value = {
      x: position.x,
      y: position.y,
    }
  }
})

onScopeDispose(stopDrag)

useEventListener('resize', updateElementInfo)
useEventListener('scroll', updateElementInfo, { capture: true })
useEventListener(window, INSPECTOR_SEARCH_EVENT, () => setActiveTab('search'))
</script>

<template>
  <div
    v-if="element"
    ref="panelRef"
    class="uno-inspect-element-info font-dm rd-md"
    b="~ solid white/10"
    :style="panelPosition"
  >
    <!-- 头部 -->
    <div
      b-b="~ solid white/10"
      class="flex justify-between items-center px-2 py-1.5 select-none text-xl"
    >
      <div i-catppuccin:unocss class="header-logo" :class="{ draggable: isSelected, dragging: isDragging }" @mousedown="startDrag" />
      <div class="flex items-center gap-2">
        <div
          i-hugeicons:cursor-magic-selection-02 class="select-btn cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100"
          :class="{ selecting: !isSelected }" title="Click to select an element"
          @click.stop="action.start()"
        />
        <div
          v-show="isSelected" i-hugeicons:cancel-01
          class="cursor-pointer opacity-70 transition-all duration-200 hover:opacity-100 text-base"
          @click.stop="action.stop()"
          @mousedown.stop
        />
      </div>
    </div>

    <!-- 标签页导航 -->
    <div
      class="flex items-center gap-1.25 px-2 py-1 no-scrollbar of-x-auto"
      b-b="~ solid white/10"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="btn-clear p-1 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center cursor-pointer @active:bg-amber/20 @active:text-amber"
        :class="{ active: activeTab.id === tab.id }"
        :title="tab.label"
        text="white/60"
        hover="bg-amber/20 text-amber"
        @click="setActiveTab(tab.id)"
      >
        <div :class="tab.icon" class="text-base" />
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="flex-1 overflow-y-auto relative no-scrollbar">
      <Transition :name="`slide-${slideDirection}`" mode="out-in">
        <KeepAlive>
          <ServerConnection v-if="['search', 'setting', 'layout'].includes(activeTab.id) && !isTrusted" />
          <component :is="activeTab.component" v-else :key="activeTab.id" />
        </KeepAlive>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.uno-inspect-element-info {
  width: min(300px, calc(100vw - 20px));
  max-height: calc(100vh - 20px);
  height: auto;
  interpolate-size: allow-keywords;
  transition: height 0.3s ease-in-out;

  color: #ccc;
  background: rgba(32, 32, 32, 0.94);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
}

.uno-inspect-element-info * {
  box-sizing: border-box;
}

@keyframes color-flashing {
  0% {
    color: var(--colors-inspect-margin);
  }
  30% {
    color: var(--colors-inspect-padding);
  }
  50% {
    color: var(--colors-inspect-border);
  }
  80% {
    color: var(--colors-inspect-content);
  }
  100% {
    color: var(--colors-inspect-margin);
  }
}

.select-btn.selecting {
  opacity: 1;
  animation: color-flashing 8s ease-in-out infinite;
}

.header-logo.draggable {
  cursor: move;
}

.header-logo.dragging {
  cursor: grabbing;
}

/* 滑动切换动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

/* 向左滑动：新内容从右边进入，旧内容向左边退出 */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 向右滑动：新内容从左边进入，旧内容向右边退出 */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.slide-left-enter-to,
.slide-left-leave-from,
.slide-right-enter-to,
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
