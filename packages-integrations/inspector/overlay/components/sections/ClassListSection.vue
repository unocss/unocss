<script lang='ts' setup>
import FormControl from '../basic/FormControl.vue'
import FormControlGroup from '../basic/FormControlGroup.vue'

interface Props {
  displayClasses: string[]
  classList: string[]
}

interface Emits {
  (e: 'update:classList', value: string[]): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div
    v-if="displayClasses.length"
    class="flex flex-wrap gap-1"
  >
    <h5 class="text-sky/80 m0 flex items-center gap-1">
      <div i-hugeicons:leaf-04 />
      Class List
    </h5>
    <FormControlGroup
      class="flex flex-wrap gap-2"
      :model-value="classList"
      type="checkbox"
      style="--context-color: var(--colors-sky-DEFAULT)"
      @update:model-value="$emit('update:classList', ($event as string[]) || [])"
    >
      <FormControl
        v-for="className in displayClasses"
        :id="`class-${className}`"
        :key="className"
        :model-value="className"
        :label="`${className}`"
        type="checkbox"
        :size="3.8"
      />
    </FormControlGroup>
  </div>
</template>
