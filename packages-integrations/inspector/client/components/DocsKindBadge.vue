<script setup lang="ts">
import type { DocsItemKind } from '../../types'

const props = defineProps<{
  kind: DocsItemKind
}>()

const badges: Record<DocsItemKind, { letter: string, title: string, class: string }> = {
  shortcut: { letter: 'S', title: 'Shortcut', class: 'bg-teal5/15 text-teal6 dark:text-teal4' },
  variant: { letter: 'V', title: 'Variants', class: 'bg-pink5/15 text-pink6 dark:text-pink4' },
  static: { letter: 'T', title: 'Static rule', class: 'bg-gray5/15 text-gray6 dark:text-gray3' },
  dynamic: { letter: 'D', title: 'Dynamic rule', class: 'bg-violet5/15 text-violet6 dark:text-violet4' },
}

const badge = computed(() => badges[props.kind])
</script>

<template>
  <span
    :title="badge.title"
    class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-xs font-medium"
    :class="badge.class"
  >{{ badge.letter }}</span>
</template>
