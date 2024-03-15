<script setup lang="ts">
import type { ResultItem } from '~/types'

const { compact = undefined, active } = defineProps<{
  item: ResultItem
  active?: boolean
  compact?: boolean | undefined
}>()

const el = ref<HTMLDivElement>()
const compactMode = computed(() => compact ?? isCompact.value)
const badgeStyle = computed(() => {
  if (compactMode.value)
    return 'w-5 h-5 text-sm'
  return ''
})

watchEffect(() => {
  if (active)
    el.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})
</script>

<template>
  <div
    ref="el"
    border="l-4 transparent" row gap3
    text-left items-center py2 px3
    cursor-pointer select-none
    :class="active ? 'bg-gray5:6' : 'op60 hover:bg-gray5:2 hover:op100'"
    :style="'css' in item ? { borderColor: item.colors?.[0] } : {}"
  >
    <template v-if="'url' in item">
      <div :class="[badgeStyle, item.type === 'caniuse' ? 'badge-square-orange' : 'badge-square-blue']" title="MDN Docs">
        {{ item.type === 'caniuse' ? 'C' : 'M' }}
      </div>
      <div flex-1>
        <h1>{{ item.type === 'caniuse' ? 'Can I Use' : 'MDN' }}: {{ item.title }}</h1>
        <div v-if="!compactMode" text-sm op50 line-clamp-2>
          {{ item.summary }}
        </div>
      </div>
      <slot flex-none>
        <a :href="item.url" target="_blank" i-carbon-launch w-5 h-5 px4 op50 hover:op100 />
      </slot>
    </template>
    <template v-else-if="item.type === 'guide'">
      <div
        badge-square-lime :class="badgeStyle" title="Guide"
      >
        G
      </div>
      <div flex-1>
        <h1>Guide: {{ item.title }}</h1>
      </div>
    </template>
    <template v-else>
      <div
        v-if="item.context?.shortcuts?.length"
        badge-square-teal :class="badgeStyle" title="Shortcut"
      >
        S
      </div>
      <div
        v-else-if="item.context?.variants.length"
        badge-square-pink :class="badgeStyle" title="Variants"
      >
        V
      </div>
      <div
        v-else-if="item.context?.rules.every(i => typeof i[0] === 'string')"
        badge-square-gray :class="badgeStyle" title="Static Rule"
      >
        T
      </div>
      <div
        v-else badge-square-violet :class="badgeStyle" title="Dynamic Rule"
      >
        D
      </div>
      <div>
        <code>{{ item.css?.startsWith('.') ? '.' : '' }}{{ item.class }}</code>
        <code v-if="item.body && !compactMode" w-full text-xs op50 line-clamp-1>{ {{ item.body }} }</code>
      </div>
    </template>
  </div>
</template>
