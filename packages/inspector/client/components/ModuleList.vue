<script setup lang="ts">
import { info, moduleTree } from '../composables/fetch'
</script>

<template>
  <div v-if="info" overflow="auto" px2 py4>
    <RouterLink to="/" text-sm m="l-3.7">
      <div i-carbon-dashboard />
      <span>
        Overview
      </span>
    </RouterLink>
    <ModuleTreeNode
      v-if="Object.keys(moduleTree.workspace.children).length"
      mt-2
      :node="moduleTree.workspace"
      icon="i-carbon-portfolio"
    />
    <ModuleTreeNode
      v-if="Object.keys(moduleTree.root.children).length"
      mt-2
      :node="moduleTree.root"
      icon="i-carbon-vmdk-disk"
    />
  </div>
</template>
