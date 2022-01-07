<script setup lang="ts">
// @ts-expect-error missing types
import { Pane, Splitpanes } from 'splitpanes'
</script>

<template>
  <div h-screen w-screen overflow="hidden">
    <Splitpanes>
      <Pane size="20" :push-other-panes="false">
        <Sidebar />
      </pane>
      <Pane size="80">
        <div h-full of-hidden>
          <RouterView />
        </div>
      </pane>
    </Splitpanes>
  </div>
</template>
