<script setup lang="ts">
import { evaluateUserConfig } from '@unocss/shared-docs'
import type { UserConfig } from '@unocss/core'

const CodeMirror = defineAsyncComponent(() => import('../../packages/inspector/client/components/CodeMirror.vue'))

const raw = ref(userConfigRaw.value || defaultConfigRaw)
const config = ref<UserConfig | undefined>()
const error = ref<Error | undefined>()
const isLoading = ref(true)
const isValid = computed(() => !isLoading.value && !error.value && !!config.value)
const isChanged = computed(() => raw.value !== (userConfigRaw.value || defaultConfigRaw))
const isDefault = computed(() => !raw.value || raw.value === defaultConfigRaw)

watchDebounced(
  () => raw.value,
  async () => {
    error.value = undefined
    isLoading.value = true
    config.value = undefined
    try {
      config.value = await evaluateUserConfig(raw.value)
    }
    catch (e) {
      console.error(e)
      config.value = undefined
      error.value = e as Error
    }
    finally {
      isLoading.value = false
    }
  },
  {
    immediate: true,
    debounce: 500,
  },
)

searchResult.value = []

function resetToDefault() {
  raw.value = defaultConfigRaw
}

function cancel() {
  currentTab.value = 'search'
}

function save() {
  if (!isValid.value)
    return
  if (isChanged.value) {
    userConfigRaw.value = raw.value
    userConfig.value = config.value
  }
  currentTab.value = 'search'
}
</script>

<template>
  <div text-left row border="t l r base" items-center>
    <div px4 py2 flex-auto>
      <div>
        Custom Config
      </div>
      <div op50 text-sm>
        Paste or edit your custom config below. Config will be saved in localStorage and used for generating the search result. AMA (auto module acquire) is enabled, you can use any browser compatible packages from npm directly.
      </div>
    </div>
  </div>
  <div text-left of-hidden grid="~ rows-[1fr_max-content]" pb5>
    <Suspense>
      <CodeMirror v-model="raw" mode="ts" h-auto font-mono border="~ base" pl2 w-full of-auto />
      <template #fallback>
        <div border="~ base" pl2 w-full flex text-center justify-center italtic op50>
          loading...
        </div>
      </template>
    </Suspense>
    <div flex-none w-full of-hidden>
      <div
        v-if="isLoading"
        bg="amber5/20"
        text="amber5 sm"
        row px4 py2 justify-start gap2 items-center
      >
        <div i-carbon-circle-dash w-5 h-5 animate-spin />
        loading...
      </div>
      <pre
        v-else-if="error"
        px4 py2
        of-auto w-full
        bg="red5/20"
        text="red5 sm"
      >{{ error.stack || error.toString() }}</pre>
      <div
        v-else-if="config"
        bg="green5/15"
        text="green5 sm"
        row px4 py2 justify-start gap2 items-center
      >
        <div i-carbon-checkmark-outline w-5 h-5 />
        <div>{{ config?.presets?.length }} presets loaded</div>
      </div>
      <div row gap-2 justify-center p3 border="b l r base" flex-none items-center>
        <button v-if="!isDefault" text-sm btn saturate-0 @click="resetToDefault()">
          Reset to default
        </button>
        <div v-else op50 text-sm>
          (using default config)
        </div>
        <div flex-auto />
        <button btn w-22 saturate-0 op70 @click="cancel()">
          Cancel
        </button>
        <button
          btn w-22
          :disabled="!isValid"
          :class="isValid ? '' : 'pointer-events-none'"
          @click="save()"
        >
          {{ isChanged ? 'Save' : 'OK' }}
        </button>
      </div>
    </div>
  </div>
</template>
