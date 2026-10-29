<script lang='ts' setup>
import { computed, ref, watch } from 'vue'
import { useElement } from '../../composables/exports/element'
import { useUnoCSS } from '../../composables/unocss'
import FormControl from '../basic/FormControl.vue'
import FormControlGroup from '../basic/FormControlGroup.vue'
import PanelTitle from '../sections/PanelTitle.vue'

const { element, tracking, triggering } = useElement()
const { formatHTML } = useUnoCSS()

// 内容类型选择
type ContentType = 'innerText' | 'innerHTML'
const contentType = ref<ContentType>('innerText')
const content = ref('')

// 获取不同类型的元素内容
const elementContent = computed(() => {
  tracking()

  if (!element.value) {
    return ''
  }

  switch (contentType.value) {
    case 'innerText':

      return element.value.innerText || ''
    case 'innerHTML':
      return element.value.innerHTML || ''
    default:
      return ''
  }
})

const hasHtmlContent = computed(() => {
  if (!element.value) {
    return false
  }
  const textContent = element.value.textContent || ''
  const innerHTML = element.value.innerHTML || ''
  return innerHTML.includes('<') && innerHTML !== textContent
})

// 推荐的内容类型
const recommendedType = computed(() => {
  if (!element.value) {
    return 'innerText'
  }

  // 如果元素包含HTML内容，推荐使用innerHTML
  if (hasHtmlContent.value) {
    return 'innerHTML'
  }

  // 否则推荐使用innerText（只显示可见文本）
  return 'innerText'
})

let formatVersion = 0

async function formatContent(value: string) {
  if (contentType.value !== 'innerHTML' || !value)
    return value

  try {
    return await formatHTML(value) || value
  }
  catch (error) {
    console.warn('[unocss-inspector] Failed to format innerHTML', error)
    return value
  }
}

watch(elementContent, async (newContent) => {
  const version = ++formatVersion
  content.value = newContent
  const formatted = await formatContent(newContent)
  if (version === formatVersion)
    content.value = formatted
}, { immediate: true })

function updateElementContent() {
  if (element.value) {
    switch (contentType.value) {
      case 'innerText':

        element.value.innerText = content.value
        break
      case 'innerHTML':
        element.value.innerHTML = content.value
        break
    }
    triggering()
  }
}

async function resetContent() {
  content.value = await formatContent(elementContent.value)
}

function useRecommendedType() {
  contentType.value = recommendedType.value
}
</script>

<template>
  <div
    v-if="element"
    class="p-3 no-scrollbar"
  >
    <PanelTitle icon="i-hugeicons:quill-write-01" title="Element Content">
      <div flex="~ items-center gap-2">
        <div
          v-if="recommendedType !== contentType"
          i-hugeicons:magic-wand-01
          :title="`Use recommended: ${recommendedType}`"
          text-sm op-64
          hover="op-100 text-blue"
          cursor-pointer
          @click="useRecommendedType"
        />
        <div
          i-hugeicons:refresh title="Reset Content"
          text-sm op-64
          hover="op-100 text-orange"
          cursor-pointer @click="resetContent"
        />
        <div
          i-hugeicons:task-done-02 title="Save Changes"
          text-base op-64
          hover="op-100 text-purple"
          cursor-pointer @click="updateElementContent"
        />
      </div>
    </PanelTitle>

    <div class="mb-1 flex items-center gap-2 text-xs">
      <span text="white/60">Type:</span>
      <FormControlGroup
        v-model="contentType"
        type="radio"
        class="flex items-center gap-3"
        style="--context-color: var(--colors-yellow-DEFAULT)"
      >
        <div
          v-for="type in ['innerText', 'innerHTML'] as ContentType[]"
          :key="type"
          class="flex items-center gap-1"
          :class="{ 'text-yellow': contentType === type, 'text-white/60': contentType !== type }"
        >
          <FormControl
            :model-value="type"
            :label="type"
            type="radio"
            shape="round"
            :size="2.8"
          />
          <div
            v-if="type === recommendedType"
            i-hugeicons:star
            class="text-xs text-yellow ml-0.5"
            title="Recommended"
          />
        </div>
      </FormControlGroup>
    </div>

    <div class="mb-2 text-2.5 text-white/50 leading-relaxed">
      <div v-if="contentType === 'innerText'" flex="~ items-center gap-1">
        <div i-hugeicons:information-circle text-sky-300 />
        Only visible text content
      </div>
      <div v-else-if="contentType === 'innerHTML'" flex="~ items-center gap-1">
        <div i-hugeicons:alert-02 text-yellow />
        HTML content with tags (be careful with XSS)
      </div>
    </div>

    <textarea
      v-model="content"
      class="btn-clear min-h-20 h-30 max-h-60 w-full resize-y box-border p-2"
      border="~ white/10 solid" rd-md
      text="xs white/72"
      :placeholder="`Enter ${contentType} content...`"
      font="mono"
    />

    <div v-if="hasHtmlContent" class="mt-2 text-xs text-orange/80 flex items-center gap-1">
      <div i-hugeicons:code />
      <span>This element contains HTML content</span>
    </div>
  </div>
</template>
