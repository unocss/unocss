<script setup lang="ts">
import type { Example } from '../../content'

defineProps<{
  item: Example
  integrations?: boolean
}>()
</script>

<template>
  <div
    h-20 text-center text-inherit
    flex="~ items-center gap-4"
    class="Link"
    :class="integrations ? 'ps-4' : 'w-80 justify-center'"
  >
    <div v-if="item.icon" :class="item.icon" w-8 h-8 flex-none />
    <div v-else-if="item.icons" w-8 h-14 flex-none flex="~ wrap items-center justify-center">
      <div v-for="icon of item.icons" :key="icon" :class="icon" w-5 h-5 />
    </div>
    <div flex="~ col" w-50 text-left>
      <span text-sm font-500 text-truncate>{{ item.name }}</span>
      <div py1 text-lg flex="~ gap-3">
        <a
          class="text-inherit! op50 hover:op100"
          flex="~ items-center gap-0.5"
          :href="`https://github.com/unocss/unocss/tree/main/examples/${item.name}`" target="_blank"
        >
          <div i-carbon-logo-github />
          <span text-xs>Source</span>
        </a>
        <a
          v-if="item.stackblitz || item.codesandbox"
          class="text-inherit! op50 hover:op100"
          flex="~ items-center gap-0.5"
          :href="item.stackblitz
            ? `https://stackblitz.com/fork/github/unocss/unocss/tree/main/examples/${item.name}`
            : `https://codesandbox.io/s/github/unocss/unocss/tree/main/examples/${item.name}`"
          target="_blank"
        >
          <div i-carbon-executable-program />
          <span text-xs>Play online</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Link {
  color: inherit !important;
  text-decoration: none !important;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s, background-color 0.25s;
}
</style>
