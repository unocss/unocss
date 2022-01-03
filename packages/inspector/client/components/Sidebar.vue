<script setup lang="ts">
import { moduleTree } from '../composables/fetch'
</script>

<template>
  <div>
    <div b="r main" of-hidden>
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
        <div b="b main" />
      </div>
    </div>
    <div b="r main" class="scrolls scrolls-sidebar">
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.workspace.children).length"
        :node="moduleTree.workspace"
        p="l3 t4"
        icon="i-carbon-portfolio"
      />
      <ModuleTreeNode
        v-if="Object.keys(moduleTree.root.children).length"
        :node="moduleTree.root"
        p="l3 t4"
        icon="i-carbon-vmdk-disk"
      />
    </div>
  </div>
</template>
