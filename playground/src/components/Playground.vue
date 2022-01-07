<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'

const bp = useBreakpoints(breakpointsTailwind)

const isMobile = bp.smaller('sm')
</script>

<template>
  <Splitpanes h-screen w-screen :horizontal="isMobile">
    <Pane>
      <Preview />
    </Pane>
    <Pane>
      <Editor />
    </Pane>
  </Splitpanes>
</template>
