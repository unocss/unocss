<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div
    style="background-color: var(--cm-background)"
    border="l y gray-400/20"
    text="gray-400/80"
    p-2
    select-none
    flex
    all:my-auto
  >
    <slot name="before"></slot>
    <div mr-5 op-60>
      {{ title }}
    </div>
    <slot></slot>
  </div>
</template>
