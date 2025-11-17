<script setup lang="ts">
/**
 * DomCapMessage Component
 *
 * Message displayed when DOM cap is reached (10 batches = 480 items).
 * Explains why auto-loading stopped and offers a manual "Load More" option.
 *
 * Features:
 * - Clear explanation for users
 * - Manual load more button
 * - Accessible
 * - Dark mode support
 */

import { InformationCircleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  totalLoaded: number
  onLoadMore: () => void
}>()
</script>

<template>
  <div class="dom-cap-message">
    <div class="dom-cap-icon">
      <InformationCircleIcon class="w-6 h-6" />
    </div>
    <div class="dom-cap-content">
      <h3 class="dom-cap-title">Performance Limit Reached</h3>
      <p class="dom-cap-text">
        You've scrolled through {{ totalLoaded }} items. To maintain smooth performance, automatic
        loading has been paused.
      </p>
      <p class="dom-cap-hint">
        You can continue loading more items manually using the button below.
      </p>
      <button type="button" class="dom-cap-button" @click="onLoadMore">
        Continue Loading
      </button>
    </div>
  </div>
</template>

<style scoped>
.dom-cap-message {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 42rem;
  background-color: rgba(14, 165, 233, 0.05);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 0.75rem;
  align-items: flex-start;
}

.dom-cap-icon {
  flex-shrink: 0;
  color: var(--color-primary, #0ea5e9);
}

.dom-cap-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dom-cap-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin: 0;
}

.dom-cap-text {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
  line-height: 1.5;
}

.dom-cap-hint {
  font-size: 0.875rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
  line-height: 1.5;
}

.dom-cap-button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background-color: var(--color-primary, #0ea5e9);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dom-cap-button:hover {
  background-color: var(--color-primary-dark, #0284c7);
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dom-cap-button:active {
  transform: translateY(0);
}

.dom-cap-button:focus-visible {
  outline: 2px solid var(--color-primary, #0ea5e9);
  outline-offset: 2px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .dom-cap-message {
    background-color: rgba(14, 165, 233, 0.1);
    border-color: rgba(14, 165, 233, 0.3);
  }

  .dom-cap-title {
    color: var(--color-text-primary-dark, #f3f4f6);
  }

  .dom-cap-text,
  .dom-cap-hint {
    color: var(--color-text-secondary-dark, #d1d5db);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .dom-cap-button {
    transition: none !important;
  }

  .dom-cap-button:hover {
    transform: none !important;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .dom-cap-message {
    flex-direction: column;
    padding: 1rem;
    margin: 1.5rem 1rem;
  }

  .dom-cap-button {
    width: 100%;
  }
}
</style>
