<script lang='ts' setup>
import { useAttributes } from '../../composables/attributes'
import { useClassList } from '../../composables/classList'
import AttributesSection from '../sections/AttributesSection.vue'
import ClassListSection from '../sections/ClassListSection.vue'
import Empty from '../sections/Empty.vue'

const { displayClasses, classList } = useClassList()
const { attributes, updateAttribute } = useAttributes()
</script>

<template>
  <div p-3>
    <Empty v-if="displayClasses.length === 0 && attributes.size === 0" />
    <template v-else>
      <ClassListSection
        :display-classes="displayClasses"
        :class-list="classList"
        @update:class-list="(newList) => classList = newList"
      />

      <div v-if="attributes.size > 0 && displayClasses.length > 0" my-2 divided />

      <AttributesSection
        :attributes="attributes"
        @update-attribute="updateAttribute"
      />
    </template>
  </div>
</template>
