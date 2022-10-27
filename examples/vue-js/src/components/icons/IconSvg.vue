<template>
  <svg class="icon" :style="{ width: fontSize, height: fontSize }" aria-hidden="true">
    <use :xlink:href="`#${name}`" />
  </svg>
</template>

<script>
export default {
  props: {
    name: { type: String, required: true },
    size: { type: [String, Number] }
  },
  computed: {
    fontSize() {
      const { size } = this
      if (!size) return
      return `${size}`.endsWith('px') ? size : `${size}px`
    }
  }
}
</script>

<style>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
