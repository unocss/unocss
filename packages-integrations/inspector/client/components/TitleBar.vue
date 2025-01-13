<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (n: 'titleClick', e: any): void
}>()
</script>

<template>
  <div
    style="background-color: var(--cm-background)"
    border="l y main"
    text="gray/80"
    min-h-30px
    max-h-30px
    select-none
    flex
    all:my-auto
  >
    <div px1 flex @click="e => emit('titleClick', e)">
      <slot name="before" />
      <div ml1 mr-2 op-60 shrink-0>
        {{ title }}
      </div>
    </div>
    <div px1 flex gap-2 flex-auto h-full>
      <slot />
    </div>
  </div>
</template>
