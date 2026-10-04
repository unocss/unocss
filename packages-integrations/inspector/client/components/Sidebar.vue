<script setup lang="ts">
import type { TreeNode } from '../composables/fetch'
import { ensureOverview, moduleTree } from '../composables/fetch'

ensureOverview()

// Show a group when it has nested folders or files directly at its root
function hasNodes(node: TreeNode) {
  return Object.keys(node.children).length > 0 || node.items.length > 0
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col" border="r main">
    <div class="flex-none" of-hidden>
      <NarBar />
      <div
        pt="4"
        flex="~ col gap-3"
      >
        <RouterLink block to="/" text-sm m="l-3.7">
          <div i-carbon-dashboard />
          <span>
            Overview
          </span>
        </RouterLink>
        <RouterLink block to="/repl" text-sm m="l-3.7">
          <div i-carbon-terminal />
          <span>
            REPL
          </span>
        </RouterLink>
        <div border="b main" />
      </div>
    </div>
    <div class="sidebar-tree min-h-0 flex-1 overflow-y-auto">
      <div v-if="hasNodes(moduleTree.workspace)" class="px-3 py-4">
        <ModuleTreeNode :node="moduleTree.workspace" icon="i-catppuccin-folder-src" />
      </div>
      <div v-if="hasNodes(moduleTree.root)" class="px-3 py-4">
        <ModuleTreeNode :node="moduleTree.root" icon="i-catppuccin-folder-open" />
      </div>
      <div v-if="hasNodes(moduleTree.nodeModules)" class="px-3 py-4">
        <ModuleTreeNode :node="moduleTree.nodeModules" icon="i-catppuccin-folder-node" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-tree {
  scrollbar-width: thin;
  scrollbar-color: var(--cm-ttc-c-thumb) var(--cm-ttc-c-track);
}
</style>
