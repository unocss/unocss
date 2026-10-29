<script lang='ts' setup>
import { useEventListener } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

interface Option {
  value: string | number
  label: string
  icon?: string
  desc?: string
}

interface Props {
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  inputable?: boolean
  borderable?: boolean
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Please select...',
  disabled: false,
  inputable: false,
  borderable: true,
})

const modelValue = defineModel<string | number>({ default: '' })

const isOpen = ref(false)
const selectRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()

const tempInputValue = ref('')

watch(modelValue, (newVal: string | number) => {
  tempInputValue.value = String(newVal || '')
}, { immediate: true })

const inputValue = computed({
  get: () => props.inputable ? tempInputValue.value : '',
  set: (value: string) => {
    tempInputValue.value = value
  },
})

function handleInputChange(event: Event) {
  if (!props.inputable)
    return
  const target = event.target as HTMLInputElement
  const value = target.value.trim()
  if (value !== String(modelValue.value || '')) {
    modelValue.value = value || ''
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.inputable)
    return
  if (event.key === 'Enter') {
    event.preventDefault()
    handleInputChange(event)
    inputRef.value?.blur()
  }
}

const selectedOption = computed(() => {
  return props.options.find(option => option.value === modelValue.value)
})

function toggleDropdown() {
  if (props.disabled)
    return
  isOpen.value = !isOpen.value
}

function selectOption(option: Option) {
  if (props.disabled)
    return
  modelValue.value = option.value
  isOpen.value = false
}

function handleClickOutside(event: Event) {
  if (selectRef.value && !event.composedPath().includes(selectRef.value)) {
    isOpen.value = false
  }
}

useEventListener('click', handleClickOutside)
</script>

<template>
  <div
    ref="selectRef"
    :class="{ 'is-disabled': disabled, 'is-open': isOpen }"
    relative
    w-full
  >
    <div
      class="select-trigger"
      text="white/80 xs"
      p="x2 y1.5"
      cursor-pointer
      flex="~ justify-between items-center"
      b="solid white/10 hover:dashed"
      :class="borderable ? 'b-1' : 'b-0'"
      rd-md
      transition-all
      duration-200
      hover:text-white
      @click="toggleDropdown"
    >
      <div flex="~ items-center gap-1">
        <slot name="prefix" />
        <span v-if="selectedOption?.icon" :class="selectedOption.icon" />
        <input
          v-if="inputable"
          ref="inputRef"
          v-model="inputValue"
          name="select-input"
          :placeholder="placeholder"
          text-size-inherit
          text-inherit
          w-full
          flex-1
          min-w-0
          bg-transparent
          border-none
          outline-none
          :class="inputClass"
          @click.stop
          @blur="handleInputChange"
          @keydown="handleKeydown"
        >
        <span v-else :class="{ 'op-50': !selectedOption }">{{ selectedOption?.label || placeholder }}</span>
      </div>
      <div flex="~ items-center gap-1">
        <slot name="suffix" />
        <div
          v-if="options.length > 0"
          :class="{ 'rotate-180': isOpen }"
          i-hugeicons:arrow-down-01
          transition-transform
          duration-200
        />
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-[-8px] scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-[-8px] scale-95"
    >
      <div
        v-if="isOpen && options.length > 0"
        absolute
        top-full
        left-0
        right-0
        z-20
        mt-1
        backdrop-blur-md
        class="bg-white/5 rd-md max-h-30 of-y-auto no-scrollbar"
        border="~ solid white/5 1px"
        select-none
      >
        <div
          v-for="option in options"
          :key="option.value"
          :class="{
            'is-selected': option.value === modelValue,
            'is-disabled': disabled,
          }"
          p="x2 y1.5"
          cursor-pointer
          flex="~ items-center gap-1.5"
          transition-all duration-150
          class="text-white text-2.75 text-op-80 hover:bg-white/5 hover:text-op-100"
          @click="selectOption(option)"
        >
          <span v-if="option.icon" :class="option.icon" />
          <span>{{ option.label }}</span>
          <sub v-if="option.desc" class="text-2.25 text-white/50 self-end">{{ option.desc }}</sub>
          <div
            v-if="option.value === modelValue"
            i-hugeicons:tick-01
            ml-auto
            text="3.25"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>
