<script setup lang="ts">
import { TreeNode } from '../composables/fetch'

withDefaults(defineProps<{
  node: TreeNode
  icon: string
}>(), {
  icon: 'i-carbon-folder',
})

const route = useRoute()
</script>

<template>
  <details open>
    <summary
      cursor-default
      select-none
      text-sm
      leading="1.6rem"
    >
      <div :class="icon"></div>
      {{ node.name }}
    </summary>

    <ModuleTreeNode v-for="e of Object.entries(node.children)" :key="e[0]" ml2 :node="e[1]" />
    <div
      v-for="i of node.items"
      :key="i.full"
      ml6
    >
      <RouterLink
        block
        text-sm
        leading="1.6rem"
        :to="`/module/${encodeURIComponent(i.full)}`"
      >
        <FileIcon :id="i.path" />
        <span
          ml-1
          op75
          hover:op100
          :class="{ 'font-bold': i.full === route.params.id}"
        >
          {{ i.path.split('/').pop() }}
        </span>
      </Routerlink>
    </div>
  </details>
</template>
