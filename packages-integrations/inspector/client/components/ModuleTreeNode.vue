<script setup lang="ts">
import type { ShallowRef } from 'vue'
import type { TreeNode } from '../composables/fetch'
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, shallowRef, useTemplateRef, watch } from 'vue'
import { overview } from '../composables/fetch'

const props = withDefaults(defineProps<{
  node: TreeNode
  icon?: string
  path?: string[]
}>(), {
  icon: 'i-catppuccin-folder',
  path: () => [],
})

const hoverKey = Symbol.for('unocss-inspector-module-tree-hover')
const hoveredPath = inject<ShallowRef<string[] | null>>(hoverKey, shallowRef<string[] | null>(null))
provide(hoverKey, hoveredPath)

const route = useRoute()
const details = useTemplateRef<HTMLDetailsElement>('details')
const branches = computed(() => [
  ...Object.entries(props.node.children).map(([key, node]) => ({ key, node, type: 'folder' as const })),
  ...props.node.items.map(item => ({ key: item.full, item, type: 'file' as const })),
])
const branchCenters = shallowRef<number[]>([])
let resizeObserver: ResizeObserver | undefined

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

function containsModule(node: TreeNode, id: string): boolean {
  return node.items.some(item => item.full === id)
    || Object.values(node.children).some(child => containsModule(child, id))
}

const activeBranchIndex = computed(() => {
  const id = route.params.id
  if (typeof id !== 'string')
    return -1
  return branches.value.findIndex(branch => branch.type === 'file'
    ? branch.item.full === id
    : containsModule(branch.node, id))
})

function isHighlighted(index: number) {
  const branch = branches.value[index]
  if (!branch)
    return false
  const hovered = hoveredPath.value
  const hoverMatches = hovered?.length && props.path.every((part, depth) => hovered[depth] === part)
    && hovered[props.path.length] === branch.key
  return Boolean(hoverMatches || activeBranchIndex.value === index)
}

function setHovered(key: string) {
  hoveredPath.value = [...props.path, key]
}

function clearHovered(key: string) {
  if (hoveredPath.value?.[props.path.length] === key)
    hoveredPath.value = null
}

function updateGeometry() {
  if (!details.value)
    return
  const parentTop = details.value.getBoundingClientRect().top
  const centers = Array.from(details.value.querySelectorAll<HTMLElement>(':scope > .module-tree-children > .module-tree-branch'))
    .map((branch) => {
      const target = branch.firstElementChild as HTMLElement | null
      const row = target?.matches('details') ? target.querySelector('summary') : target
      const rect = row?.getBoundingClientRect()
      return rect ? rect.top - parentTop + rect.height / 2 : 0
    })
  if (centers.length !== branchCenters.value.length || centers.some((center, index) => center !== branchCenters.value[index]))
    branchCenters.value = centers
}

function observeGeometry() {
  resizeObserver?.disconnect()
  if (!details.value || !resizeObserver)
    return
  resizeObserver.observe(details.value)
  details.value.querySelectorAll<HTMLElement>(':scope > .module-tree-children > .module-tree-branch').forEach((branch) => {
    resizeObserver!.observe(branch)
    const target = branch.firstElementChild as HTMLElement | null
    const row = target?.matches('details') ? target.querySelector('summary') : target
    if (row)
      resizeObserver!.observe(row)
  })
  updateGeometry()
}

onMounted(() => {
  resizeObserver = new ResizeObserver(updateGeometry)
  observeGeometry()
})
watch(() => props.node, async () => {
  await nextTick()
  observeGeometry()
})
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<template>
  <details ref="details" class="relative min-w-0" open>
    <summary
      class="relative z-1 flex min-h-7 cursor-default select-none items-center gap-2 rounded-md px-2 text-sm font-medium hover:bg-gray:8"
      :title="nodeTitle(node)"
      :class="{ op40: hasNoGeneratedCssInNode(node) }"
      @mouseenter="setHovered('')"
      @mouseleave="clearHovered('')"
    >
      <span class="icon-catppuccin inline-block h-4 w-4 shrink-0" :class="icon" aria-hidden="true" />
      <InlineText :text="node.name || ''" class="min-w-0 flex-1 text-sm font-normal" />
    </summary>

    <svg v-if="branchCenters.length" class="pointer-events-none absolute left-0 top-0 overflow-hidden" aria-hidden="true" width="32" height="100%">
      <path class="module-tree-line fill-none stroke-current" :d="`M 16 24 V ${branchCenters[branchCenters.length - 1] - 8}`" />
      <path
        v-for="(center, index) in branchCenters"
        :key="`base-${index}`"
        class="module-tree-line fill-none stroke-current"
        :d="`M 16 ${center - 8} Q 16 ${center} 24 ${center} H 31`"
      />
      <path
        v-for="(center, index) in branchCenters"
        v-show="isHighlighted(index)"
        :key="`active-${index}`"
        class="module-tree-line-active fill-none stroke-current text-blue-500 dark:text-yellow-400"
        :d="`M 16 24 V ${center - 8} Q 16 ${center} 24 ${center} H 31`"
      />
    </svg>

    <div v-if="branches.length" class="module-tree-children relative z-1 ml-3 pl-5">
      <div v-for="branch in branches" :key="branch.key" class="module-tree-branch min-w-0">
        <ModuleTreeNode
          v-if="branch.type === 'folder'"
          :node="branch.node"
          :path="[...path, branch.key]"
        />
        <RouterLink
          v-else
          class="my-0.5 flex min-h-7 min-w-0 items-center gap-2 rounded-md px-2 text-sm text-inherit no-underline hover:bg-gray/8"
          :to="`/module/${encodeURIComponent(branch.item.full)}`"
          :title="moduleTitle(branch.item.path, branch.item.full)"
          :class="{ 'bg-blue/10 text-blue! dark:bg-yellow/10 dark:text-yellow!': branch.item.full === route.params.id, 'op40': hasNoGeneratedCss(branch.item.full) }"
          @mouseenter="setHovered(branch.key)"
          @mouseleave="clearHovered(branch.key)"
        >
          <FileIcon :id="branch.item.path" />
          <InlineText :text="branch.item.path.split('/').pop() || ''" class="min-w-0 flex-1" />
        </RouterLink>
      </div>
    </div>
  </details>
</template>

<style scoped>
.module-tree-line {
  color: rgb(150 155 165 / 45%);
  stroke-width: 1;
  stroke-dasharray: 2 3;
}

.module-tree-line-active {
  stroke-width: 1.5;
}
</style>
