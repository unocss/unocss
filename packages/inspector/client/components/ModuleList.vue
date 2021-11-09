<script setup lang="ts">
import { info, moduleTree } from '../composables/fetch'
</script>

<template>
  <div
    v-if="info"
    overflow="auto"
    p="x2 y4"
    flex="~ col gap-4"
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
    <ModuleTreeNode
      v-if="Object.keys(moduleTree.workspace.children).length"
      :node="moduleTree.workspace"
      icon="i-carbon-portfolio"
    />
    <ModuleTreeNode
      v-if="Object.keys(moduleTree.root.children).length"
      :node="moduleTree.root"
      icon="i-carbon-vmdk-disk"
    />
  </div>
</template>
