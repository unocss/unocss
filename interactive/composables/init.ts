export function initSearch() {
  const route = useRoute()
  const router = useRouter()

  watch(
    () => route.query.s,
    async () => {
      input.value = String(route.query.s || '')
      await excuteSearch()
    },
    { immediate: true },
  )

  async function excuteSearch() {
    isSearching.value = true
    try {
      searchResult.value = await searcher.search(input.value)
    }
    catch (e) {
      console.error(e)
    }
    isSearching.value = false

    selectIndex.value = 0
    isModalOpen.value = false

    await router.replace({
      path: '/',
      query: {
        s: input.value,
      },
    })
  }

  throttledWatch(
    input,
    excuteSearch,
    { throttle: 100, immediate: true },
  )
}
