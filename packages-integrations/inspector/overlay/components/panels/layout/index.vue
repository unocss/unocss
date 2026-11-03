<script lang='ts' setup>
import { useToggle } from '@vueuse/core'
import { computed, ref, watch, watchEffect } from 'vue'
import { useClassList } from '../../../composables/classList'
import { useElement } from '../../../composables/exports/element'
import PanelTitle from '../../sections/PanelTitle.vue'
import FlexCol from './FlexCol.vue'
import FlexRow from './FlexRow.vue'
import Freedom from './Freedom.vue'
import Grid from './Grid.vue'
import { withoutClasses } from './helper'

const { element } = useElement()
const { classList } = useClassList()
const isInlineElement = ref(false)

const list = ref([
  { id: 'freedom', icon: 'i-custom:freedom?mask', component: Freedom },
  { id: 'horizontal', icon: 'i-custom:horizontal?mask', component: FlexRow },
  { id: 'vertical', icon: 'i-custom:vertical?mask', component: FlexCol },
  { id: 'grid', icon: 'i-hugeicons:dashboard-square-03?mask', component: Grid },
])

const selectedId = ref(list.value[0].id)
const selected = computed(() => list.value.find(i => i.id === selectedId.value) || list.value[0])

function handleSelect(id: string) {
  selectedId.value = id
  applyLayout(id)
}

const [openWrap, toggleWrap] = useToggle(false)

const layoutClassChecks = [
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'flex-row',
  'flex-col',
  'flex-wrap',
  'flex-nowrap',
]

function syncElementDisplay(el: HTMLElement) {
  const computedStyle = window.getComputedStyle(el)
  isInlineElement.value = computedStyle.display.startsWith('inline')
}

function applyLayout(id: string) {
  if (!element.value)
    return

  const baseClasses = withoutClasses(classList.value, layoutClassChecks)
  const displayValue = isInlineElement.value
    ? (id === 'grid' ? 'inline-grid' : 'inline-flex')
    : (id === 'grid' ? 'grid' : 'flex')

  if (id === 'freedom') {
    classList.value = baseClasses
    return
  }

  if (id === 'horizontal') {
    classList.value = [
      ...baseClasses,
      displayValue,
      'flex-row',
      openWrap.value ? 'flex-wrap' : 'flex-nowrap',
    ]
    return
  }

  if (id === 'vertical') {
    classList.value = [
      ...baseClasses,
      displayValue,
      'flex-col',
      'flex-nowrap',
    ]
    return
  }

  if (id === 'grid') {
    classList.value = [
      ...baseClasses,
      displayValue,
    ]
  }
}

function handleToggleWrap() {
  toggleWrap()
  if (selectedId.value === 'horizontal')
    applyLayout('horizontal')
}

watchEffect(() => {
  if (element.value) {
    syncElementDisplay(element.value)
    const style = window.getComputedStyle(element.value)

    if (style.display.includes('flex')) {
      const direction = style.flexDirection
      if (direction === 'column') {
        selectedId.value = 'vertical'
      }
      else {
        selectedId.value = 'horizontal'
      }

      if (style.flexWrap === 'wrap') {
        openWrap.value = true
      }
      else {
        openWrap.value = false
      }
    }

    else if (style.display.includes('grid')) {
      selectedId.value = 'grid'
    }

    else {
      selectedId.value = 'freedom'
    }

    // flex-wrap
    if (style.flexWrap === 'wrap') {
      openWrap.value = true
    }
  }
})

watch(element, (el) => {
  if (el)
    syncElementDisplay(el)
}, { immediate: true })
</script>

<template>
  <section p-2>
    <PanelTitle title="Auto Layout" icon="i-hugeicons:dashboard-square-02">
      <div flex="~ items-center gap-1">
        <div
          v-if="selected.id === 'horizontal'"
          title="Wrap text"
          i-hugeicons:text-wrap
          op-50 hover:op-100 cursor-pointer :class="{ 'text-purple op-100!': openWrap }"
          @click="handleToggleWrap"
        />
      </div>
    </PanelTitle>

    <div
      flex="~ items-center gap-2"
      bg="white/10"
      rd-sm p-0.5 mb-2
      un-children="py-0.75 flex-1 flex items-center justify-center rd-2.5px text-sm op-50 @active:op-100 @active:bg-white/20! cursor-pointer hover:bg-white/50 transition-all"
    >
      <div
        v-for="item in list" :key="item.id"
        :class="{ active: selected.id === item.id }"
        :title="item.id"
        @click="handleSelect(item.id)"
      >
        <div :class="item.icon" />
      </div>
    </div>
    <div min-h-40>
      <Transition
        enter-active-class="animate-fade-in animate-duration-200"
        leave-active-class="animate-fade-out animate-duration-200"
        mode="out-in"
      >
        <component :is="selected.component" :wrap="openWrap" />
      </Transition>
    </div>
  </section>
</template>
