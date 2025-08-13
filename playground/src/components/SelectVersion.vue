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

function getLink(version: string) {
  if (version === 'latest')
    return `https://github.com/unocss/unocss/commit/${sha}`
  return `https://github.com/unocss/unocss/releases/tag/v${version}`
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
              h('span', { class: 'op75 text-xs' }, '(latest)'),
            ]
          : [
              h('span', `${latestVersion}*`),
              h('span', { class: 'op75 font-mono text-xs' }, `(${latestVersionSha.slice(0, 7)})`),
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
    <button flex="~ gap-0.5 items-center" rounded hover="bg-hover" pl2 pr1 @click="toggle">
      <VersionRender :version="selectedVersion" c-primary />
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
        class="group"
        :class="ver === selectedVersion ? 'c-primary font-bold' : ''"
      >
        <button flex-auto text-left @click="setVersion(ver)">
          <VersionRender :version="ver" />
        </button>
        <a rounded hover="bg-gray/5 op100!" group-hover:op50 op0 p1 target="_blank" :href="getLink(ver)">
          <div i-ri-arrow-right-up-line />
        </a>
      </div>
    </div>
  </div>
</template>
