<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

const props = withDefaults(defineProps<{
  /** The current code (controlled). */
  modelValue: string
  /** Number of digits. */
  length?: number
  disabled?: boolean
  /** Error state that paints the boxes red and shakes them. */
  invalid?: boolean
  /** Accessible label for the group. */
  label?: string
}>(), {
  length: 6,
  disabled: false,
  invalid: false,
  label: 'One-time authorization code',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  /** Emitted once every box is filled. */
  (e: 'complete', value: string): void
}>()

const boxes = ref<HTMLInputElement[]>([])

/** The code split into exactly `length` slots (empty string for blanks). */
const digits = computed(() =>
  Array.from({ length: props.length }, (_, i) => props.modelValue[i] ?? ''),
)

function setBoxRef(el: Element | ComponentPublicInstance | null, i: number): void {
  if (el)
    boxes.value[i] = el as HTMLInputElement
}

function focusBox(i: number): void {
  const clamped = Math.max(0, Math.min(props.length - 1, i))
  nextTick(() => {
    const el = boxes.value[clamped]
    el?.focus()
    el?.select()
  })
}

function commit(next: string): void {
  const clean = next.replace(/\D/g, '').slice(0, props.length)
  if (clean !== props.modelValue)
    emit('update:modelValue', clean)
  if (clean.length === props.length)
    emit('complete', clean)
}

/** Overwrite slots starting at `from` with `chars`; returns the next index. */
function fillFrom(from: number, chars: string): number {
  const arr = digits.value.slice()
  let idx = from
  for (const c of chars) {
    if (idx >= props.length)
      break
    arr[idx] = c
    idx++
  }
  commit(arr.join(''))
  return idx
}

function onInput(i: number, event: Event): void {
  const el = event.target as HTMLInputElement
  const raw = el.value.replace(/\D/g, '')
  if (!raw) {
    const arr = digits.value.slice()
    arr[i] = ''
    commit(arr.join(''))
    return
  }
  // Multiple chars can arrive at once (autofill / fast typing), so spread them.
  const next = fillFrom(i, raw)
  focusBox(next)
}

function onKeydown(i: number, event: KeyboardEvent): void {
  switch (event.key) {
    case 'Backspace': {
      event.preventDefault()
      const arr = digits.value.slice()
      if (arr[i]) {
        arr[i] = ''
        commit(arr.join(''))
      }
      else if (i > 0) {
        arr[i - 1] = ''
        commit(arr.join(''))
        focusBox(i - 1)
      }
      break
    }
    case 'Delete': {
      event.preventDefault()
      const arr = digits.value.slice()
      arr[i] = ''
      commit(arr.join(''))
      break
    }
    case 'ArrowLeft':
      event.preventDefault()
      focusBox(i - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      focusBox(i + 1)
      break
    case 'Home':
      event.preventDefault()
      focusBox(0)
      break
    case 'End':
      event.preventDefault()
      focusBox(props.length - 1)
      break
  }
}

function onPaste(i: number, event: ClipboardEvent): void {
  event.preventDefault()
  const text = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '')
  if (!text)
    return
  const next = fillFrom(i, text.slice(0, props.length - i))
  focusBox(next)
}

function onFocus(event: FocusEvent): void {
  (event.target as HTMLInputElement).select()
}

function boxClass(i: number): string {
  if (props.invalid)
    return 'border-red/70 text-red'
  if (digits.value[i])
    return 'border-teal5/50'
  return 'border-main'
}

defineExpose({
  /** Focus the first empty box (or the last one when full). */
  focus() {
    const firstEmpty = digits.value.findIndex(d => !d)
    focusBox(firstEmpty === -1 ? props.length - 1 : firstEmpty)
  },
})
</script>

<template>
  <div
    role="group"
    :aria-label="label"
    flex items-center justify-center gap-2
    :class="invalid ? 'otp-shake' : ''"
  >
    <input
      v-for="(digit, i) in digits"
      :key="i"
      :ref="el => setBoxRef(el, i)"
      :value="digit"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      :aria-label="`Digit ${i + 1} of ${length}`"
      :aria-invalid="invalid || undefined"
      :disabled="disabled"
      maxlength="1"
      class="w-11 h-14 text-center text-2xl font-mono rounded-lg border bg-transparent outline-none transition-all duration-150 focus:border-teal5 focus:ring-3 focus:ring-teal5/25 disabled:op40 disabled:pointer-events-none"
      :class="boxClass(i)"
      @input="onInput(i, $event)"
      @keydown="onKeydown(i, $event)"
      @paste="onPaste(i, $event)"
      @focus="onFocus"
    >
  </div>
</template>

<style scoped>
@keyframes otp-shake {
  10%,
  90% {
    transform: translateX(-1px);
  }
  20%,
  80% {
    transform: translateX(2px);
  }
  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }
  40%,
  60% {
    transform: translateX(4px);
  }
}
.otp-shake {
  animation: otp-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
