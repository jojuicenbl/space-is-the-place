<script setup lang="ts">
/**
 * InfiniteScrollSentinel Component
 *
 * Invisible sentinel element used by IntersectionObserver.
 * When this element becomes visible, it triggers loading more items.
 *
 * Features:
 * - Minimal visual footprint
 * - Accessible (hidden from screen readers with aria-hidden)
 * - Optional debug mode to make it visible
 */

import { ref } from 'vue'

defineProps<{
  debug?: boolean // Show the sentinel for debugging purposes
}>()

const sentinel = ref<HTMLElement | null>(null)

// Expose the sentinel element to parent components
defineExpose({
  sentinel
})
</script>

<template>
  <div
    ref="sentinel"
    class="infinite-scroll-sentinel"
    :class="{ debug }"
    aria-hidden="true"
    role="presentation"
  >
    <span v-if="debug" class="debug-label">Sentinel</span>
  </div>
</template>

<style scoped>
.infinite-scroll-sentinel {
  /* Minimal size to be detected by IntersectionObserver */
  width: 100%;
  height: 1px;
  min-height: 1px;

  /* Invisible by default */
  opacity: 0;
  pointer-events: none;

  /* For debugging */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Debug mode */
.infinite-scroll-sentinel.debug {
  opacity: 1;
  height: 2rem;
  background-color: rgba(14, 165, 233, 0.1);
  border: 2px dashed var(--color-primary, #0ea5e9);
  border-radius: 0.25rem;
  margin: 1rem 0;
}

.debug-label {
  font-size: 0.75rem;
  color: var(--color-primary, #0ea5e9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
