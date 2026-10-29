<script lang='ts' setup>
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <h5 m0 mb-2 flex="~ items-center justify-between">
    <div flex="~ items-center gap-1">
      <div v-if="icon" :class="icon" />
      <span>{{ title }}</span>
    </div>

    <slot />
  </h5>
</template>
