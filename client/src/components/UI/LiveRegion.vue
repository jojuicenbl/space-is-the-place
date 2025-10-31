<script setup lang="ts">
/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes to screen readers.
 * Used to announce when new items are loaded in infinite scroll.
 *
 * Features:
 * - Invisible but accessible to screen readers
 * - Configurable politeness level (polite/assertive)
 * - Auto-clear messages after a delay
 */

import { ref, watch } from 'vue'

const props = defineProps<{
  message: string
  politeness?: 'polite' | 'assertive'
  autoClear?: boolean
  clearDelay?: number // in milliseconds
}>()

const internalMessage = ref(props.message)

// Watch for message changes and update internal message
watch(
  () => props.message,
  (newMessage) => {
    internalMessage.value = newMessage

    // Auto-clear after delay
    if (props.autoClear && newMessage) {
      setTimeout(() => {
        internalMessage.value = ''
      }, props.clearDelay ?? 3000)
    }
  }
)
</script>

<template>
  <div
    :aria-live="politeness ?? 'polite'"
    aria-atomic="true"
    class="live-region"
  >
    {{ internalMessage }}
  </div>
</template>

<style scoped>
.live-region {
  /* Visually hidden but accessible to screen readers */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
