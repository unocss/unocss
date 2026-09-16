<script setup lang="ts">
import { authError, connectionStatus, isTrusted, requestAuthCode, submitAuthCode } from '../composables/rpc'

const CODE_LENGTH = 6

const code = ref('')
const hint = ref('')
const isSubmitting = ref(false)
const isReissuing = ref(false)
const otp = ref<{ focus: () => void }>()

const isReady = computed(() => connectionStatus.value === 'connected' && isTrusted.value)
const isReconnecting = computed(() => connectionStatus.value === 'disconnected' || connectionStatus.value === 'error')
const needsCode = computed(() => connectionStatus.value === 'connected' && !isTrusted.value)

// Ask the host to print its code banner the moment the auth screen appears; the
// server dedupes per code, so this never spams the terminal, and an already
// trusted page never shows this screen at all.
watch(needsCode, (needed) => {
  if (needed) {
    requestAuthCode().catch(() => {})
    otp.value?.focus()
  }
}, { immediate: true })

// When a failed attempt clears the boxes we don't want that programmatic reset
// to also wipe the error message it just set, so skip the next change once.
let skipErrorClear = false

watch(code, () => {
  hint.value = ''
  if (skipErrorClear) {
    skipErrorClear = false
    return
  }
  if (authError.value)
    authError.value = null
})

async function submit() {
  if (code.value.length < CODE_LENGTH || isSubmitting.value)
    return
  isSubmitting.value = true
  try {
    const ok = await submitAuthCode(code.value)
    if (!ok) {
      skipErrorClear = true
      code.value = ''
      otp.value?.focus()
    }
    // On success the client emits a trust event and this screen swaps out.
  }
  finally {
    isSubmitting.value = false
  }
}

async function reissue() {
  if (isReissuing.value)
    return
  isReissuing.value = true
  authError.value = null
  hint.value = ''
  try {
    await requestAuthCode(true)
    hint.value = 'A new code was printed in your terminal.'
    otp.value?.focus()
  }
  catch {
    authError.value = 'Could not request a new code. Please try again.'
  }
  finally {
    isReissuing.value = false
  }
}
</script>

<template>
  <template v-if="isReady">
    <slot />
  </template>
  <div v-else h-full w-full flex items-center justify-center overflow-auto p8 bg-white dark:bg-black>
    <template v-if="connectionStatus === 'connecting'">
      <div flex items-center gap-2 op50>
        <div i-carbon-circle-dash animate-spin />
        Connecting…
      </div>
    </template>

    <template v-else-if="isReconnecting">
      <div flex flex-col items-center gap-2>
        <div flex items-center gap-2 op50>
          <div i-carbon-circle-dash animate-spin />
          Connection lost — reconnecting…
        </div>
        <div op40 text-sm text-center>
          Make sure your dev server is running.
        </div>
      </div>
    </template>

    <template v-else>
      <div w-full max-w-108 flex flex-col items-center text-center>
        <div relative flex items-center justify-center>
          <div absolute w-24 h-24 rounded-full bg-teal5:20 blur-2xl aria-hidden="true" />
          <!-- Resolved at runtime relative to the SPA's mount base -->
          <!-- eslint-disable-next-line vue/no-useless-v-bind -->
          <img :src="'favicon.svg'" alt="UnoCSS" relative w-16 h-16>
        </div>

        <h1 mt4 text-2xl font-bold tracking-tight>
          Authorize UnoCSS Inspector
        </h1>
        <p mt2 text-sm op60 leading-relaxed max-w-92>
          The Inspector reads your dev server's UnoCSS configuration and
          generated CSS. Confirm it's you before continuing.
        </p>

        <div mt6 w-full flex flex-col items-center gap-4 p6 border="~ main rounded-lg">
          <p text-sm op60>
            Find the
            <span font-mono text-teal5>6-digit code</span>
            printed in your terminal.
          </p>

          <form flex flex-col items-center gap-4 w-full autocomplete="off" @submit.prevent="submit">
            <OtpInput
              ref="otp"
              v-model="code"
              :length="CODE_LENGTH"
              :invalid="!!authError"
              :disabled="isSubmitting"
              label="Enter your one-time authorization code"
              @complete="submit"
            />

            <button
              type="submit"
              w-full flex items-center justify-center gap-2 py2 rounded
              bg-active hover:op80 disabled:op50 disabled:pointer-events-none
              :disabled="isSubmitting || code.length < CODE_LENGTH"
            >
              <div :class="isSubmitting ? 'i-carbon-circle-dash animate-spin' : 'i-carbon-locked'" />
              {{ isSubmitting ? 'Authorizing…' : 'Authorize' }}
            </button>

            <p
              v-if="authError || isSubmitting || hint"
              text-sm min-h-5
              :class="authError ? 'text-red' : 'op50'"
              role="alert"
              aria-live="assertive"
            >
              <template v-if="authError">
                {{ authError }}
              </template>
              <template v-else-if="isSubmitting">
                Authorizing…
              </template>
              <template v-else>
                {{ hint }}
              </template>
            </p>
          </form>

          <button
            type="button"
            flex items-center gap-1.5 text-xs op60 hover:op100 disabled:op40
            :disabled="isSubmitting || isReissuing"
            @click="reissue"
          >
            <div :class="isReissuing ? 'i-carbon-circle-dash animate-spin' : 'i-carbon-renew'" />
            Re-issue one-time code
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
