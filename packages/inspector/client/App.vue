<template>
  <splitpanes h-full flex>
    <pane min-size="5" size="10" :push-other-panes="false">
      <Sidebar />
    </pane>
    <pane size="90">
      <div h-full of-hidden>
        <RouterView />
      </div>
    </pane>
  </splitpanes>
</template>
<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes'
</script>
