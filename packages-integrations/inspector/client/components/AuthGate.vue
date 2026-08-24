<script setup lang="ts">
import { authError, connectionStatus, isTrusted, submitAuthCode } from '../composables/rpc'

const code = ref('')
const isSubmitting = ref(false)

const isReady = computed(() => connectionStatus.value === 'connected' && isTrusted.value)
const isReconnecting = computed(() => connectionStatus.value === 'disconnected' || connectionStatus.value === 'error')

async function submit() {
  if (!code.value || isSubmitting.value)
    return
  isSubmitting.value = true
  try {
    await submitAuthCode(code.value)
  }
  finally {
    isSubmitting.value = false
    code.value = ''
  }
}
</script>

<template>
  <template v-if="isReady">
    <slot />
  </template>
  <div v-else h-full w-full flex items-center justify-center bg-white dark:bg-black>
    <div flex flex-col items-center gap-4 p8 border="~ main rounded" min-w-90>
      <!-- Resolved at runtime relative to the SPA's mount base -->
      <!-- eslint-disable-next-line vue/no-useless-v-bind -->
      <img :src="'favicon.svg'" alt="UnoCSS" w-12 h-12>
      <div text-lg>
        UnoCSS Inspector
      </div>

      <template v-if="connectionStatus === 'connecting'">
        <div flex items-center gap-2 op50>
          <div i-carbon-circle-dash animate-spin />
          Connecting…
        </div>
      </template>

      <template v-else-if="isReconnecting">
        <div flex items-center gap-2 op50>
          <div i-carbon-circle-dash animate-spin />
          Connection lost — reconnecting…
        </div>
        <div op40 text-sm text-center>
          Make sure your dev server is running.
        </div>
      </template>

      <template v-else>
        <div op60 text-sm text-center max-w-70>
          Enter the one-time code printed in your dev server terminal to
          access the inspector.
        </div>
        <form flex gap-2 @submit.prevent="submit">
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="6-digit code"
            maxlength="6"
            border="~ main rounded"
            bg-transparent px3 py1 w-32 text-center font-mono tracking-widest
            :disabled="isSubmitting"
          >
          <button
            type="submit"
            border="~ main rounded"
            px3 py1 bg-active hover:op80
            :disabled="isSubmitting || !code"
          >
            Unlock
          </button>
        </form>
        <div v-if="authError" text-red text-sm max-w-70 text-center>
          {{ authError }}
        </div>
      </template>
    </div>
  </div>
</template>
