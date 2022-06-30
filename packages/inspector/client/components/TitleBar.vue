<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div
    style="background-color: var(--cm-background)"
    border="l y gray/20"
    text="gray/80"
    p1
    min-h-30px
    max-h-30px
    select-none
    flex
    all:my-auto
  >
    <div flex @click="e => $emit('titleClick', e)">
      <slot name="before" />
      <div mr-2 op-60>
        {{ title }}
      </div>
    </div>
    <div flex gap-2 flex-auto>
      <slot />
    </div>
  </div>
</template>
