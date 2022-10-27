<template>
  <i :style="{ color, fontSize }" :class="name" />
</template>

<script>
export default {
  props: {
    color: { type: String },
    size: { type: [String, Number] },
    name: { type: String, required: true },
  },
  computed: {
    fontSize() {
      const { size } = this
      if (!size) return ''
      return `${size}`.endsWith('px') ? size : `${size}px`
    }
  }
}
</script>
