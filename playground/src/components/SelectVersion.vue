<script setup lang="ts">
import { decompressFromEncodedURIComponent as decode, compressToEncodedURIComponent as encode } from 'lz-string'

const expanded = ref(false)
const currentVersion = ref('')
const unocssVersions = ref<string[]>([])

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
  currentVersion.value = version
  const url = new URL(window.location.href)
  url.searchParams.set('version', encode(currentVersion.value))
  window.history.replaceState('', '', `${url.pathname}${url.search}`)
  window.location.reload()
}
onMounted(async () => {
  const url = new URL(window.location.href)
  unocssVersions.value = await getVersionsList()
  currentVersion.value = decode(url.searchParams.get('version') || '') || unocssVersions.value[0]
  window.addEventListener('click', () => {
    expanded.value = false
  })
  window.addEventListener('blur', () => {
    if (document.activeElement?.tagName === 'IFRAME') {
      expanded.value = false
    }
  })
})
</script>

<template>
  <div v-if="currentVersion" class="ml-2 mr-3 relative text-sm" @click.stop>
    <span class="place-items-center cursor-pointer relative active-version after:(top-50% -translate-y-50% absolute content-[''] border-l-4 ml-2 border-l-transparent border-r-4 border-r-transparent border-t-6 border-gray-400)" @click="toggle">
      <span class="c-green ml-1">v{{ currentVersion }}</span>
    </span>

    <ul v-if="expanded" class="top-24px bg-white py-2 px-3 space-y-2 max-h-450px of-y-auto absolute top-0 mt-1">
      <li v-for="ver of unocssVersions" :key="ver" class="hover:c-green cursor-pointer mr-2">
        <a @click="setVersion(ver)">v{{ ver }}</a>
      </li>
    </ul>
  </div>
</template>
