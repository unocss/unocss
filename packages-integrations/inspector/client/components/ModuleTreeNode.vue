<script setup lang="ts">
import type { TreeNode } from '../composables/fetch'
import { computed } from 'vue'
import { overview } from '../composables/fetch'

withDefaults(defineProps<{
  node: TreeNode
  icon?: string
}>(), {
  icon: 'i-catppuccin-folder',
})

const route = useRoute()
const modulesWithCss = computed(() => new Set([
  ...(overview.value?.matched ?? []),
  ...(overview.value?.icons ?? []),
].flatMap(item => item.modules)))

function hasNoGeneratedCss(id: string) {
  return Boolean(overview.value) && !modulesWithCss.value.has(id)
}

function hasNoGeneratedCssInNode(node: TreeNode): boolean {
  if (!overview.value)
    return false

  const hasGeneratedDescendant = node.items.some(item => modulesWithCss.value.has(item.full))
    || Object.values(node.children).some(child => !hasNoGeneratedCssInNode(child))

  return !hasGeneratedDescendant && (node.items.length > 0 || Object.keys(node.children).length > 0)
}

function moduleTitle(path: string, id: string) {
  return hasNoGeneratedCss(id) ? `${path} · no generated UnoCSS CSS` : path
}

function nodeTitle(node: TreeNode) {
  return hasNoGeneratedCssInNode(node) ? `${node.name} · no generated UnoCSS CSS in descendants` : node.name
}
</script>

<template>
  <details class="min-w-0" open>
    <summary
      class="flex min-h-7 cursor-default select-none items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-gray:8"
      :title="nodeTitle(node)"
      :class="{ op40: hasNoGeneratedCssInNode(node) }"
    >
      <span class="icon-catppuccin inline-block h-4 w-4 shrink-0" :class="icon" aria-hidden="true" />
      <InlineText :text="node.name || ''" class="min-w-0 flex-1 text-sm font-normal" />
    </summary>

    <div class="ml-3 border-l border-gray:20 pl-3">
      <ModuleTreeNode v-for="e of Object.entries(node.children)" :key="e[0]" :node="e[1]" />
    </div>
    <div class="ml-3 border-l border-gray:20 pl-3">
      <RouterLink
        v-for="i of node.items"
        :key="i.full"
        class="my-0.5 flex min-h-7 min-w-0 items-center gap-2 rounded-md px-2 text-sm text-inherit no-underline hover:bg-gray:8"
        :to="`/module/${encodeURIComponent(i.full)}`"
        :title="moduleTitle(i.path, i.full)"
        :class="{ 'bg-active': i.full === route.params.id, 'op40': hasNoGeneratedCss(i.full) }"
      >
        <FileIcon :id="i.path" />
        <InlineText :text="i.path.split('/').pop() || ''" class="min-w-0 flex-1" />
      </RouterLink>
    </div>
  </details>
</template>
