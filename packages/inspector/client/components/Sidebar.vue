<script setup lang="ts">
import { moduleTree } from '../composables/fetch'
</script>

<template>
  <div h-full grid="~ rows-[max-content,1fr]" b="r main" of-hidden>
    <NarBar />
    <div
      overflow="auto"
      p="y4"
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
      <div b="b main"></div>
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.workspace.children).length"
        :node="moduleTree.workspace"
        pl3
        icon="i-carbon-portfolio"
      />
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.root.children).length"
        :node="moduleTree.root"
        pl3
        icon="i-carbon-vmdk-disk"
      />
    </div>
  </div>
</template>
