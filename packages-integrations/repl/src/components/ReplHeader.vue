<script setup lang="ts">
import { useStoreContext } from '../store'
import SelectVersion from './SelectVersion.vue'

withDefaults(defineProps<{
  /** Header title @default 'UnoCSS Repl' */
  name?: string
  /** Currently selected UnoCSS version. Enables version selector when set. */
  version?: string
  /** NPM package name for version fetching @default 'unocss' */
  packageName?: string
}>(), {
  name: 'UnoCSS Repl',
  packageName: 'unocss',
})

const emit = defineEmits<{
  'update:version': [version: string]
}>()

const store = useStoreContext()
</script>

<template>
  <div
    flex items-center gap2 px3 h-30px
    border="b main"
    style="background-color: var(--cm-background)"
  >
    <slot name="left">
      <span text-sm>{{ name }}</span>
      <SelectVersion
        v-if="version !== undefined"
        :model-value="version"
        :package="packageName"
        @update:model-value="emit('update:version', $event)"
      />
    </slot>
    <div flex-auto />
    <slot name="right">
      <label flex items-center gap1 cursor-pointer>
        <input v-model="store.options.value.responsive" type="checkbox">
        <span text-sm>Responsive</span>
      </label>
    </slot>
  </div>
</template>
