<script setup lang="ts">
// @ts-expect-error
import { Splitpanes, Pane } from 'splitpanes'
</script>

<template>
  <Splitpanes h-full flex>
    <Pane size="15" :push-other-panes="false">
      <Sidebar />
    </pane>
    <Pane size="85">
      <div h-full of-hidden>
        <RouterView />
      </div>
    </pane>
  </Splitpanes>
</template>
