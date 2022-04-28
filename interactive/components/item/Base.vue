<script setup lang="ts">
import type { ResultItem } from '~/types'

const { compact = undefined } = defineProps<{
  active?: boolean
  compact?: boolean | undefined
  badgeClass?: string
  badgeTitle?: string
}>()

const compactMode = $computed(() => compact ?? isCompact.value)
const badgeStyle = $computed(() => {
  if (compactMode)
    return 'w-5 h-5 text-sm'
  return ''
})
</script>

<template>
  <div
    row gap3
    border="l-4 transparent"
    text-left items-center py2 px3
    cursor-pointer select-none
    :class="active ? 'bg-gray5:6' : 'op60 hover:bg-gray5:2 hover:op100'"
  >
    <div :class="[badgeStyle, badgeClass]" :title="badgeTitle">
      <slot name="badge" />
    </div>
    <div flex-1>
      <h1><slot name="title" /></h1>
      <slot v-if="!compactMode" name="detail" text-sm op50 line-clamp-2 />
    </div>
    <slot flex-none name="tail" />
  </div>
</template>
