<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: string | number
  color?: string
}>()
const fontSize = computed(() => {
  const { size } = props
  if (!size) return ''
  return `${size}`.endsWith('px') ? size : `${size}px`
})
</script>

<template>
  <i :style="{ color, fontSize }" :class="name" />
</template>
