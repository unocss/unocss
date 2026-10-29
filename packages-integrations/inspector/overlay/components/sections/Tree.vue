<script lang='ts' setup>
import { ref } from 'vue'
import { getElementColor } from '../../utils'
import FormControl from '../basic/FormControl.vue'

interface Props {
  elements: Element[]
  depth?: number
  elFilter?: (el: Element) => boolean
  checkedElement: Element | null
  onHover?: (el: Element | null) => void
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
})

const emit = defineEmits<{
  (e: 'change', el: Element): void
}>()

function handleHover(el: Element | null) {
  props.onHover?.(el)
}

const elementIds = new WeakMap<Element, number>()
let nextId = 0
function elementId(element: Element) {
  if (!elementIds.has(element))
    elementIds.set(element, nextId++)
  return elementIds.get(element)!
}

const expandedStates = ref<Map<Element, boolean>>(new Map())

function getChildElements(element: Element): Element[] {
  return Array.from(element.children).filter(el => !props.elFilter || !props.elFilter(el))
}

function toggleExpanded(element: Element) {
  const currentState = expandedStates.value.get(element) ?? true
  expandedStates.value.set(element, !currentState)
}

function isExpanded(element: Element): boolean {
  return expandedStates.value.get(element) ?? true
}
</script>

<template>
  <div>
    <template v-for="child in elements" :key="elementId(child)">
      <div :style="{ paddingLeft: `${props.depth * 2}px` }" class="">
        <div
          class="flex items-center gap-1 w-full hover:bg-white/10 px-1.5 py-1 my-1 group rounded-sm"
          :class="{ 'important:bg-white/10': checkedElement === child }"
          @click="getChildElements(child).length > 0 && toggleExpanded(child)"
          @mouseenter="handleHover(child)"
          @mouseleave="handleHover(null)"
        >
          <div
            v-if="getChildElements(child).length > 0"
            class="text-xs transition-transform duration-200"
            :class="isExpanded(child) ? 'rotate-0' : '-rotate-90'"
            i-hugeicons:arrow-down-01
          />
          <div class="flex-1 of-hidden whitespace-nowrap text-xs cursor-pointer select-none">
            <span :class="[getElementColor(child.tagName.toLowerCase()), checkedElement === child ? 'fw-bold' : '']">
              {{ child.tagName.toLowerCase() }}
            </span>
            <span v-if="child.id" class="text-yellow-400 op-72 text-2.75 ml-1">#{{ child.id }}</span>
            <span class="group-hover:op-100 op-0" :class="{ 'op-100!': checkedElement === child }">
              <template v-for="cls in Array.from(child.classList)" :key="cls">
                <span class="text-green-400 op-72 text-2.75 ml-1">.{{ cls }}</span>
              </template>
            </span>
          </div>
          <div class="ml-1 h-4 flex items-center op-0 group-hover:op-100" :class="{ 'op-100!': checkedElement === child }" @click.stop="emit('change', child)">
            <FormControl
              type="radio"
              shape="round"
              :size="3"
              style="--context-color: var(--colors-purple-DEFAULT)"
              :model-value="checkedElement === child"
            />
          </div>
        </div>

        <Tree
          v-if="getChildElements(child).length > 0 && isExpanded(child)"
          :elements="getChildElements(child)"
          :depth="depth + 1"
          :el-filter="elFilter"
          :checked-element="checkedElement"
          :on-hover="onHover"
          @change="(el) => emit('change', el)"
        />
      </div>
    </template>
  </div>
</template>
