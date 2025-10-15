<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>
<template>
  <span class="tag-pill">
    {{ text }}
  </span>
</template>
<style scoped>
.tag-pill {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f0f0f0;
  border-radius: 16px;
  font-size: 0.875rem;
  color: #666;
  margin: 4px;
  transition: all 0.2s ease;
  flex: 0 1 auto;
  white-space: no-wrap;
  max-width: 100%;
}

.tag-pill:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}
</style>
