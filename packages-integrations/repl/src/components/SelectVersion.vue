<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { defineComponent, h, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  /** Currently selected version */
  modelValue?: string
  /** NPM package name to fetch versions for */
  package?: string
}>(), {
  modelValue: 'latest',
  package: 'unocss',
})

const emit = defineEmits<{
  'update:modelValue': [version: string]
}>()

const expanded = ref(false)
const el = ref<HTMLElement | null>(null)
const versions = ref<string[]>([])

onClickOutside(el, () => {
  expanded.value = false
})

async function fetchVersions() {
  try {
    const res = await fetch(
      `https://data.jsdelivr.com/v1/package/npm/${props.package}`,
    )
    const { versions: list } = (await res.json()) as { versions: string[] }
    return list
      .filter(i => !i.includes('-'))
      .slice(0, 25)
  }
  catch {
    return []
  }
}

function setVersion(version: string) {
  emit('update:modelValue', version)
  expanded.value = false
}

const VersionRender = defineComponent({
  props: {
    version: String,
  },
  setup(versionProps) {
    return () => h(
      'span',
      {},
      versionProps.version === 'latest'
        ? 'latest'
        : `v${versionProps.version}`,
    )
  },
})

onMounted(async () => {
  versions.value = [
    'latest',
    ...await fetchVersions(),
  ]
})
</script>

<template>
  <div v-if="versions.length" ref="el" class="ml-2 mr-3 relative text-sm" @click.stop>
    <button flex="~ gap-0.5 items-center" rounded hover="bg-hover" pl2 pr1 @click="expanded = !expanded">
      <VersionRender :version="modelValue" c-primary />
      <div i-ri-arrow-down-s-line flex-none />
    </button>

    <div
      v-if="expanded"
      class="top-20px bg-main max-h-450px of-y-auto absolute left--5px z-100 py1"
      flex="~ col"
      border="~ main rounded" shadow font-mono
    >
      <div
        v-for="ver of versions" :key="ver"
        hover="hover:bg-hover"
        flex="~ items-center gap-1"
        ws-nowrap pl3 pr1 py0.5
        :class="ver === modelValue ? 'c-primary font-bold' : ''"
      >
        <button flex-auto text-left @click="setVersion(ver)">
          <VersionRender :version="ver" />
        </button>
      </div>
    </div>
  </div>
</template>
