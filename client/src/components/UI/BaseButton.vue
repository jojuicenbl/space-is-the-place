<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
}

defineProps<Props>()
</script>
<template>
  <button class="base-button" :class="[`variant-${variant || 'primary'}`]">
    <slot></slot>
  </button>
</template>
<style scoped>
.base-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.variant-primary {
  background-color: #1a1a1a;
  color: white;
  border: 2px solid transparent;
}

.variant-primary:hover {
  background-color: #333;
}

.variant-secondary {
  background-color: transparent;
  border: 2px solid #1a1a1a;
  color: #1a1a1a;
}

.variant-secondary:hover {
  background-color: #f5f5f5;
}
</style>
