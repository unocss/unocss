<script lang='ts' setup>
import FormControl from '../basic/FormControl.vue'
import FormControlGroup from '../basic/FormControlGroup.vue'

interface AttributeData {
  all: string[]
  active: string[]
}

interface Props {
  attributes: Map<string, AttributeData> | undefined
}

interface Emits {
  (e: 'updateAttribute', attrName: string, newValues: string[]): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<template>
  <div v-if="attributes?.size" class="flex flex-col gap-1">
    <h5 class="text-teal/80 m0 flex items-center gap-1">
      <div i-hugeicons:leaf-01 />
      <span>Attributes</span>
    </h5>
    <div class="flex flex-col gap-2">
      <div
        v-for="[key, attrData] in attributes!"
        :key="key"
        class="flex gap-2"
      >
        <span class="text-sm" :class="{ 'op-50': attrData.active.length === 0 }">{{ key }}</span>
        <div
          v-if="attrData.all.length"
          flex="1 ~ justify-end gap-1.5"
          style="--context-color: var(--colors-teal-DEFAULT)"
        >
          <FormControlGroup
            :model-value="attrData.active"
            class="flex flex-wrap gap-2"
            type="checkbox"
            justify-end
            @update:model-value="(newValues) => $emit('updateAttribute', key, (newValues as string[]) || [])"
          >
            <FormControl
              v-for="value in attrData.all"
              :id="`attr-${key}-${value}`"
              :key="value"
              :model-value="value"
              :label="value"
              type="checkbox"
              shape="round"
              :size="3.8"
            />
          </FormControlGroup>
        </div>
      </div>
    </div>
  </div>
</template>
