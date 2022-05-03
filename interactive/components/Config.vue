<script setup lang="ts">
import { evaluateUserConfig } from '@unocss/shared-docs'
import type { UserConfig } from '@unocss/core'
import CodeMirror from '../../packages/inspector/client/components/CodeMirror.vue'

let raw = $ref(userConfigRaw.value || defaultConfigStr)
let config = $ref<UserConfig | undefined>()
let error = $ref<Error | undefined>()
let isLoading = $ref(true)
const isValid = $computed(() => !isLoading && !error && !!config)
const isChanged = $computed(() => raw !== (userConfigRaw.value || defaultConfigStr))
const isDefault = $computed(() => !raw || raw === defaultConfigStr)

watchDebounced(
  () => raw,
  async () => {
    error = undefined
    isLoading = true
    config = undefined
    try {
      config = await evaluateUserConfig(raw)
    }
    catch (e) {
      config = undefined
      error = e as Error
    }
    finally {
      isLoading = false
    }
  },
  {
    immediate: true,
    debounce: 500,
  },
)

searchResult.value = []

function resetToDefault() {
  raw = defaultConfigStr
}

function cancel() {
  currentTab.value = 'search'
}

function save() {
  if (!isValid)
    return
  userConfigRaw.value = raw
  userConfig.value = config
  currentTab.value = 'search'
}
</script>

<template>
  <div text-left row border="t l r base" items-center>
    <div px4 py2 flex-auto>
      <div font-bold>
        Config
      </div>
      <div op50 text-sm>
        Paste or edit your custom config below
      </div>
    </div>
    <div px4 py2 items-center>
      <button v-if="!isDefault" text-sm btn saturate-0 @click="resetToDefault()">
        Reset to default
      </button>
      <div v-else op50 text-sm>
        (using default config)
      </div>
    </div>
  </div>
  <div text-left of-hidden grid="~ rows-[1fr_max-content]" pb5>
    <CodeMirror v-model="raw" mode="ts" h-auto font-mono border="~ base" pl2 w-full of-auto />
    <div flex-none w-full of-hidden>
      <div
        v-if="isLoading"
        bg="amber-400/20"
        text="amber-400 sm"
        row px4 py2 justify-start gap2 items-center
      >
        <div i-carbon-circle-dash w-5 h-5 animate-spin />
        loading...
      </div>
      <pre
        v-else-if="error"
        px4 py2
        of-auto w-full
        bg="red-400/20"
        text="red-400 sm"
      >{{ error.stack || error.toString() }}</pre>
      <div
        v-else-if="config"
        bg="green-400/20"
        text="green-400 sm"
        row px4 py2 justify-start gap2 items-center
      >
        <div i-carbon-checkmark-outline w-5 h-5 />
        <div>{{ config?.presets?.length }} presets loaded</div>
      </div>
      <div row gap-2 justify-center p3 border="b l r base" flex-none items-center>
        <button
          btn
          :disabled="!isValid"
          :class="isValid ? '' : 'pointer-events-none'"
          @click="save()"
        >
          Save{{ isChanged ? '*' : '' }}
        </button>
        <button btn saturate-0 @click="cancel()">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
