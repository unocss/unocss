<script lang='ts' setup>
import type { VNode } from 'vue'
import { computed, ref, watch } from 'vue'
import { useElement } from '../../composables/exports/element'
import FormControl from '../basic/FormControl.vue'
import FormControlGroup from '../basic/FormControlGroup.vue'
import Select from '../basic/Select.vue'
import Empty from '../sections/Empty.vue'
import PanelTitle from '../sections/PanelTitle.vue'

const { element, tracking } = useElement()

const enabledStyleKeys = ref<string[]>([])

const enabledStyles = computed(() => {
  const result: Record<string, boolean> = {}
  enabledStyleKeys.value.forEach((key) => {
    result[key] = true
  })
  return result
})

const styles = computed(() => {
  tracking()

  const inlineStyles: Record<string, string> = {}

  if (!element.value) {
    return inlineStyles
  }

  const el = element.value
  if (el.style.length > 0) {
    const vnode = (el as any).__vnode as VNode | undefined
    if (vnode) {
      for (const [key, value] of Object.entries(vnode.props?.style || {})) {
        inlineStyles[key] = value as string
      }
    }
    else {
      for (let i = 0; i < el.style.length; i++) {
        const property = el.style.item(i)
        inlineStyles[property] = el.style.getPropertyValue(property)
      }
    }
  }

  return inlineStyles
})

watch(styles, (newStyles) => {
  const styleKeys = Object.keys(newStyles)
  // 确保 enabledStyleKeys 包含所有当前存在的样式
  enabledStyleKeys.value = styleKeys
}, { immediate: true })

watch(enabledStyleKeys, (newEnabledKeys, oldEnabledKeys) => {
  if (!element.value)
    return

  const el = element.value
  const allStyleKeys = Object.keys(styles.value)

  newEnabledKeys.forEach((key) => {
    if (!oldEnabledKeys?.includes(key)) {
      const originalValue = styles.value[key]
      if (originalValue) {
        el.style.setProperty(key, originalValue)
      }
    }
  })

  allStyleKeys.forEach((key) => {
    if (!newEnabledKeys.includes(key) && oldEnabledKeys?.includes(key)) {
      el.style.removeProperty(key)
    }
  })
}, { deep: true })

// 更新样式属性名称
function updateStyleProperty(oldKey: string, newKey: string) {
  if (!element.value || !newKey.trim() || oldKey === newKey)
    return

  // 检查当前样式是否被启用
  if (!enabledStyles.value[oldKey])
    return

  const el = element.value
  const value = styles.value[oldKey]

  // 移除旧属性
  el.style.removeProperty(oldKey)

  // 设置新属性
  if (value) {
    el.style.setProperty(newKey, value)
  }

  // 更新 enabledStyleKeys - 替换旧键为新键
  const newKeys = [...enabledStyleKeys.value]
  const index = newKeys.indexOf(oldKey)
  if (index !== -1) {
    newKeys[index] = newKey
    enabledStyleKeys.value = newKeys
  }
}

// 更新样式属性值
function updateStyleValue(key: string, newValue: string) {
  if (!element.value || !key)
    return

  // 检查当前样式是否被启用
  if (!enabledStyles.value[key])
    return

  const el = element.value

  if (newValue.trim()) {
    el.style.setProperty(key, newValue)
  }
  else {
    el.style.removeProperty(key)
    // 如果移除了样式属性，也需要从 enabledStyleKeys 中移除
    const index = enabledStyleKeys.value.indexOf(key)
    if (index !== -1) {
      enabledStyleKeys.value.splice(index, 1)
    }
  }
}
</script>

<template>
  <div p-3 no-scrollbar>
    <PanelTitle title="Styles" icon="i-hugeicons:drawing-mode" />
    <FormControlGroup v-if="Object.keys(styles).length > 0" v-model="enabledStyleKeys" type="checkbox" class="space-y-1.5">
      <div
        v-for="(value, key) in styles"
        :key="`inline-${key}`"
        class="flex items-center group w-full"
        :class="{ 'op-50': !enabledStyles[key] }"
      >
        <FormControl
          style="--context-color: var(--colors-purple-DEFAULT)"
          shape="round"
          type="checkbox"
          :size="3.4"
          :model-value="key"
          class="group-hover:opacity-100 opacity-0 transition-opacity duration-200"
        />
        <div flex="~ items-center gap-2" flex-1>
          <div v-if="!enabledStyles[key]" class="text-sky-300 px-2.1 py-1.5 text-xs flex-[0_0_35%] select-none decoration-line-through">
            {{ key }}
          </div>
          <Select
            v-else
            class="flex-[0_0_35%]"
            :model-value="key"
            :borderable="false"
            inputable
            placeholder="Property"
            input-class="text-sky-300"
            @update:model-value="(newKey) => updateStyleProperty(key, String(newKey))"
          />

          <span class="text-white/50 text-xs">:</span>

          <div v-if="!enabledStyles[key]" class="text-white/80 px-2.1 py-1.5 text-xs flex-1 select-none decoration-line-through">
            {{ value }}
          </div>
          <Select
            v-else
            :model-value="value"
            flex-1
            :borderable="false"
            inputable
            placeholder="Value"
            input-class="text-white/80"
            @update:model-value="(newValue) => updateStyleValue(key, String(newValue))"
          />
        </div>
      </div>
    </FormControlGroup>
    <Empty v-else />
  </div>
</template>
