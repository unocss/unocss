<script setup lang="ts">
import type { TreeNode } from '../composables/fetch'
import { moduleTree } from '../composables/fetch'

// Show a group when it has nested folders or files directly at its root
function hasNodes(node: TreeNode) {
  return Object.keys(node.children).length > 0 || node.items.length > 0
}
</script>

<template>
  <div h-full border="r main">
    <div of-hidden>
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
    <div class="scrolls scrolls-sidebar">
      <ModuleTreeNode
        v-if="hasNodes(moduleTree.workspace)"
        :node="moduleTree.workspace"
        p="l3 t4"
        icon="i-carbon-portfolio"
      />
      <ModuleTreeNode
        v-if="hasNodes(moduleTree.root)"
        :node="moduleTree.root"
        p="l3 t4"
        icon="i-carbon-vmdk-disk"
      />
      <ModuleTreeNode
        v-if="hasNodes(moduleTree.nodeModules)"
        :node="moduleTree.nodeModules"
        p="l3 t4"
        icon="i-carbon-categories"
      />
    </div>
  </div>
</template>
