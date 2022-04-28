<script setup lang="ts">
const { level = 1 } = defineProps<{
  item: string | Record<string, string>
  level?: number
}>()

const ignores = ['inherit', 'current', 'transparent', 'DEFAULT']
</script>

<template>
  <template v-if="typeof item === 'string'">
    <div w-15 h-10 rounded border="~ base" shadow :style="{ background: item }" />
  </template>
  <template v-for="i of Object.entries(item)" v-else :key="i[0]">
    <div v-if="!ignores.includes(i[0]) && i[0].length > 1">
      <div :style="{ opacity: 0.7 / level + 0.3 }" :class="level < 2 ? 'mt4' : 0">
        {{ i[0] }}
      </div>
      <div row gap2>
        <ColorsItem :item="i[1]" :level="level + 1" />
      </div>
    </div>
  </template>
</template>
