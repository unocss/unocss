<script setup lang="ts">
import { kebabCase } from 'scule'

const { level = 1 } = defineProps<{
  item: Record<string, string>
  level?: number
}>()

const ignores = ['inherit', 'current', 'transparent', 'DEFAULT']
</script>

<template>
  <template v-for="i of Object.entries(item)" :key="i[0]">
    <div v-if="!ignores.includes(i[0]) && i[0].length > 1">
      <div :style="{ opacity: 0.7 / level + 0.3 }" :class="level < 2 ? 'mt4 font-bold' : 'text-sm'">
        {{ kebabCase(i[0]) }}
      </div>
      <template v-if="typeof i[1] === 'string'">
        <div font-mono text-sm op30>
          {{ i[1] }}
        </div>
        <div w-17 h-9 mt1 border="~ base" shadow :style="{ background: i[1] }" />
      </template>
      <div v-else row gap1 flex-wrap>
        <ColorsItem :item="i[1]" :level="level + 1" />
      </div>
    </div>
  </template>
</template>
