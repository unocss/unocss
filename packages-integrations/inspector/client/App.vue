<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
</script>

<template>
  <div h-full w-full of-hidden bg-white dark:bg-black>
    <AuthGate>
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
    </AuthGate>
  </div>
</template>
