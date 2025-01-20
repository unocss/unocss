<script setup lang="ts">
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
</script>

<template>
  <div h-full w-full of-hidden>
    <Splitpanes>
      <Pane size="20" :push-other-panes="false">
        <Sidebar />
      </Pane>
      <Pane size="80">
        <div h-full of-hidden>
          <RouterView />
        </div>
      </Pane>
    </Splitpanes>
  </div>
</template>
