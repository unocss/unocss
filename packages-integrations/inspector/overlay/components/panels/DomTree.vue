<script lang='ts' setup>
import { useDebounceFn } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useElement } from '../../composables/exports'
import Tree from '../sections/Tree.vue'

const { element } = useElement()

const rootElements = ref<Element[]>([])

function useExcludes() {
  const excludes = {
    tags: ['style', 'script', 'link', 'meta', 'title', 'noscript', 'template'],
    class: ['uno-inspect'],
    id: ['__uno-inspector', 'unocss-inspector-root'],
  }

  function isExcluded(el: Element) {
    if (excludes.tags.includes(el.tagName.toLowerCase()))
      return true
    if (excludes.id.includes(el.id))
      return true
    if (Array.from(el.classList).some(cls => excludes.class.includes(cls)))
      return true
    return false
  }

  return {
    isExcluded,
  }
}

const { isExcluded } = useExcludes()

function shouldFilterElement(el: Element): boolean {
  return isExcluded(el) || getComputedStyle(el).pointerEvents === 'none'
}

const updateInSelf = ref(false)
const latestSelected = ref<Element | null>(element.value)
const debouncedHover = useDebounceFn((el: Element | null) => {
  if (el) {
    element.value = el as HTMLElement
  }
  else {
    element.value = latestSelected.value as any
  }
  updateInSelf.value = true
  setTimeout(() => {
    updateInSelf.value = false
  }, 100)
}, 150)

function handleSelected(el: Element) {
  latestSelected.value = el
  element.value = el as HTMLElement
  updateInSelf.value = true
  setTimeout(() => {
    updateInSelf.value = false
  }, 100)
}

onMounted(() => {
  rootElements.value = Array.from(document.body.children).filter(el => !shouldFilterElement(el))
})

watch(element, (newEl) => {
  if (!updateInSelf.value) {
    latestSelected.value = newEl
  }
})
</script>

<template>
  <div p-2 h-60 of-y-auto no-scrollbar>
    <Tree
      :elements="rootElements"
      :checked-element="latestSelected"
      :el-filter="shouldFilterElement"
      :on-hover="debouncedHover"
      @change="handleSelected"
    />
  </div>
</template>
