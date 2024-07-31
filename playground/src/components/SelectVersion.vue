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
  return list
}
async function toggle() {
  expanded.value = !expanded.value
}
function setVersion(version: string) {
  unocssVersion.value = version
  updateUrl()
  location.reload()
}
onMounted(async () => {
  versions.value = await getVersionsList()
})
</script>

<template>
  <div v-if="unocssVersion" ref="el" class="ml-2 mr-3 relative text-sm" @click.stop>
    <span class="place-items-center cursor-pointer relative active-version after:(top-50% -translate-y-50% absolute content-[''] border-l-4 ml-2 border-l-transparent border-r-4 border-r-transparent border-t-6 border-gray-400)" @click="toggle">
      <span class="c-green ml-1">v{{ unocssVersion }}</span>
    </span>

    <ul
      v-if="expanded"
      class="top-18px bg-base py-2 px-3 space-y-2 max-h-450px of-y-auto absolute top-0 mt-1"
      border="~ base rounded" shadow font-mono
    >
      <li v-for="ver of versions" :key="ver" class="hover:c-green cursor-pointer mr-2">
        <a @click="setVersion(ver)">v{{ ver }}</a>
      </li>
    </ul>
  </div>
</template>
