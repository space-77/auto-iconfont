<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: string | number
}>()

const fontSize = computed(() => {
  const { size } = props
  if (!size) return ''
  return `${size}`.endsWith('px') ?  size : `${size}px`
})
</script>

<template>
  <svg class="icon" :style="{width: fontSize, height: fontSize}" aria-hidden="true">
    <use :xlink:href="`#${name}`" />
  </svg>
</template>

<style>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>