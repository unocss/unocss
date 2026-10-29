<script lang='ts' setup>
import { onMounted, ref, useTemplateRef } from 'vue'

withDefaults(defineProps<{
  color: string
  size?: number
}>(), {
  size: 3.5,
})

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const ctx = ref<CanvasRenderingContext2D | null>(null)

function drawBg() {
  if (!ctx.value || !canvas.value)
    return

  const gridSize = 3
  const { width, height } = canvas.value.getBoundingClientRect()

  canvas.value.width = width
  canvas.value.height = height
  ctx.value.clearRect(0, 0, width, height)

  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      ctx.value.fillStyle = ((x / gridSize + y / gridSize) % 2 === 0) ? '#ffffffcc' : '#88888888'
      ctx.value.fillRect(x, y, gridSize, gridSize)
    }
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d')
    drawBg()
  }
})
</script>

<template>
  <div
    class="inline-block rounded group-hover:rounded-50% transition-all relative of-hidden"
    :style="{
      width: `calc(var(--spacing) * ${size})`,
      height: `calc(var(--spacing) * ${size})`,
    }"
    :title="color"
  >
    <canvas ref="canvas" size-full />
    <div class="absolute inset-0" :style="{ backgroundColor: color }" />
  </div>
</template>
