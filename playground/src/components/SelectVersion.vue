<script setup lang="ts">
const expanded = ref(false)
const el = ref<HTMLElement | null>(null)
const versions = ref<string[]>([])

onClickOutside(el, () => {
  expanded.value = false
})

async function getVersionsList() {
  const fetchVersions = async () => {
    const res = await fetch(
      'https://data.jsdelivr.com/v1/package/npm/unocss',
    )
    const { versions } = (await res.json()) as { versions: string[] }
    return versions
  }
  const list = await fetchVersions()
  // Filter out pre-releases and limit to latest 25 versions
  return list
    .filter(i => !i.includes('-'))
    .slice(0, 25)
}

const sha = __SHA__
const latestVersion = __LASTEST_TAG__
const latestVersionSha = __LASTEST_TAG_SHA__

const isRelease = sha === latestVersionSha

async function toggle() {
  expanded.value = !expanded.value
}
function setVersion(version: string) {
  selectedVersion.value = version
  updateUrl()
  location.reload()
}

const VersionRender = defineComponent({
  props: {
    version: String,
  },
  setup(props) {
    return () => h(
      'span',
      {},
      props.version === 'latest'
        ? isRelease
          ? [
              h('span', latestVersion),
              h('span', { class: 'op50 text-xs' }, '(latest)'),
            ]
          : [
              h('span', `${latestVersion}*`),
              h('span', { class: 'op50 font-mono text-xs' }, `(${latestVersionSha.slice(0, 7)})`),
            ]
        : `v${props.version}`,
    )
  },
})

onMounted(async () => {
  versions.value = [
    'latest',
    ...await getVersionsList(),
  ]
})
</script>

<template>
  <div v-if="selectedVersion" ref="el" class="ml-2 mr-3 relative text-sm" @click.stop>
    <button flex="~ gap-0.5 items-center" rounded hover="bg-gray/5" pl2 pr1 @click="toggle">
      <VersionRender :version="selectedVersion" c-green />
      <div i-ri-arrow-down-s-line />
    </button>

    <div
      v-if="expanded"
      class="top-18px bg-base max-h-450px of-y-auto absolute top-0"
      flex="~ col"
      border="~ base rounded" shadow font-mono
    >
      <button
        v-for="ver of versions" :key="ver"
        hover="c-green hover:bg-gray/5"
        ws-nowrap text-left px3 py0.5
        @click="setVersion(ver)"
      >
        <VersionRender :version="ver" />
      </button>
    </div>
  </div>
</template>
