<script setup lang="ts">
interface Props {
  text: string
  align?: "left" | "center" | "right"
}

const props = withDefaults(defineProps<Props>(), {
  align: "left",
})
</script>

<template>
  <h1 class="main-title" :class="[`text-${props.align}`]">
    {{ text }}
  </h1>
</template>

<style scoped>
.main-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}
</style>
