<script setup lang="ts">
import { breakpoints, currentTab, isModalOpen, searchResult, selectIndex } from '~/composables/state'

const lg = breakpoints.lg

const modal = computed<boolean>({
  get() {
    return isModalOpen.value && !!searchResult.value[selectIndex.value]
  },
  set(v) {
    isModalOpen.value = v
  },
})
</script>

<template>
  <div grid="~ lg:cols-2 gap2" px8>
    <div h-full flex="~ col">
      <TheNav />
      <div v-if="currentTab === 'config'" class="scrolls" flex-auto>
        <Config />
      </div>
      <Search v-else />
    </div>
    <template v-if="lg">
      <DetailsResult :item="searchResult[selectIndex]" />
    </template>
    <template v-else>
      <Modal v-model="modal">
        <DetailsResult :item="searchResult[selectIndex]" />
      </Modal>
    </template>
  </div>
</template>
