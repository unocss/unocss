<script lang='ts' setup>
defineProps<{
  label: string
  icon?: string
}>()
</script>

<template>
  <div
    b-b="~ solid white/10"
    class="text-3.25 flex items-center pb-2"
  >
    <div class="w-4.5 text-center text-base op-80">
      <div :class="icon" />
    </div>
    <div class="mx-1 font-medium whitespace-nowrap op-80">
      {{ label }}
    </div>
    <div class="flex-1 font-medium flex justify-end">
      <slot />
    </div>
  </div>
</template>
