<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { authError, connectionStatus, requestAuthCode, submitAuthCode } from '../client-rpc'

const code = ref('')
const submitting = ref(false)
const needsCode = computed(() => ['connected', 'unauthorized'].includes(connectionStatus.value))

watch(needsCode, (needed) => {
  if (needed)
    requestAuthCode().catch(() => {})
}, { immediate: true })

async function submit() {
  submitting.value = true
  try {
    await submitAuthCode(code.value)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="p-3 text-xs" @submit.prevent="submit">
    <template v-if="needsCode">
      <p>Enter the 6-digit code from your dev server terminal to use CSS search, layout previews, and settings.</p>
      <input
        v-model="code" aria-label="Authorization code" inputmode="numeric" autocomplete="one-time-code"
        maxlength="6" class="w-full bg-transparent border border-white/20 rounded p-2"
      >
      <button type="submit" class="mt-2 btn-clear text-green-300" :disabled="submitting || code.length !== 6">
        {{ submitting ? 'Authorizing…' : 'Authorize' }}
      </button>
      <p v-if="authError" role="alert" class="text-red-300">
        {{ authError }}
      </p>
    </template>
    <p v-else>
      Connecting to the UnoCSS dev server…
    </p>
  </form>
</template>
