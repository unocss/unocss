export function initSearch() {
  const route = useRoute()
  const router = useRouter()

  watchEffect(() => {
    input.value = String(route.query.s || '')
  })

  throttledWatch(
    input,
    async () => {
      isSearching.value = true
      try {
        searchResult.value = await search(input.value)
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
    },
    { throttle: 100, immediate: true },
  )
}
