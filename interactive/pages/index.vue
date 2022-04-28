<script setup lang="ts">
import { breakpoints, isModalOpen, searchResult, selectIndex } from '~/composables/state'

const lg = breakpoints.lg

const modal = $computed<boolean>({
  get() {
    return isModalOpen.value && !!searchResult.value[selectIndex.value]
  },
  set(v) {
    isModalOpen.value = v
  },
})
</script>

<template>
  <div grid="~ lg:cols-2 gap2" px8 h-full of-hidden>
    <Search />
    <template v-if="lg">
      <DetailsResult v-if="searchResult[selectIndex]" :item="searchResult[selectIndex]" />
    </template>
    <template v-else>
      <Modal v-model="modal">
        <DetailsResult v-if="searchResult[selectIndex]" :item="searchResult[selectIndex]" />
      </Modal>
    </template>
  </div>
</template>
