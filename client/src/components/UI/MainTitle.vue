<script setup lang="ts">
interface Props {
  text: string
  align?: "left" | "center" | "right"
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  align: "left",
})
</script>

<template>
  <h1 class="main-title" :class="[`text-${props.align}`]">
    <a 
      v-if="href" 
      :href="href" 
      target="_blank" 
      rel="noopener noreferrer"
      class="title-link"
    >
      {{ text }}
    </a>
    <span v-else>{{ text }}</span>
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

.title-link {
  color: inherit;
  text-decoration: none;
  transition: 0.3s ease;
}

.title-link:hover {
  /* color: #1976d2; */
  text-decoration: underline;
  /* transition: 0.3s ease; */
}
</style>
