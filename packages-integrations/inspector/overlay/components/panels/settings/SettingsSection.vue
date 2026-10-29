<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  count?: number
  defaultCollapsed?: boolean
}>()

const collapsed = ref(props.defaultCollapsed ?? props.title !== 'Overview')
</script>

<template>
  <div class="b b-white/10 rounded bg-white/5 overflow-hidden">
    <div
      class="px-3 py-2 text-sm font-bold opacity-75 bg-white/5 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors"
      @click="collapsed = !collapsed"
    >
      <div class="flex items-center gap-2">
        <div :class="collapsed ? 'i-hugeicons:arrow-right-01' : 'i-hugeicons:arrow-down-01'" />
        <span class="capitalize">{{ title }}</span>
      </div>
      <span v-if="count !== undefined" class="text-xs opacity-50 bg-black/20 px-1.5 py-0.5 rounded-full">{{ count }}</span>
    </div>
    <div v-show="!collapsed" class="p-3 text-xs overflow-auto max-h-100">
      <slot />
    </div>
  </div>
</template>
