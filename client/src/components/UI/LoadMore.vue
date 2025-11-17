<script setup lang="ts">
/**
 * LoadMore Component
 *
 * Manual load more button for infinite scroll.
 * Used as fallback when:
 * - Network error occurs
 * - DOM cap is reached
 * - User preference for manual loading
 *
 * Features:
 * - Loading state with spinner
 * - Error state with retry option
 * - Accessible (ARIA labels)
 * - Dark mode support
 */

import { ArrowDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  isLoading?: boolean
  error?: string | null
  variant?: 'primary' | 'secondary'
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

const handleClick = () => {
  emit('load-more')
}
</script>

<template>
  <div class="load-more-container">
    <button
      type="button"
      :disabled="isLoading"
      :aria-label="isLoading ? 'Loading more items...' : 'Load more items'"
      :class="[
        'load-more-button',
        variant === 'secondary' ? 'load-more-button-secondary' : 'load-more-button-primary',
        { loading: isLoading }
      ]"
      @click="handleClick"
    >
      <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
      <ArrowDownIcon v-else class="w-5 h-5" aria-hidden="true" />
      <span class="button-text">
        {{ isLoading ? 'Loading...' : error ? 'Retry' : 'Load More' }}
      </span>
    </button>

    <p v-if="error" class="error-message">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.load-more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  width: 100%;
}

.load-more-button {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  /* Size */
  padding: 0.75rem 1.5rem;
  min-width: 10rem;

  /* Typography */
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;

  /* Border and radius */
  border-radius: 0.5rem;
  border: 1px solid transparent;

  /* Transition */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Cursor */
  cursor: pointer;
}

.load-more-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.load-more-button:focus-visible {
  outline: 2px solid var(--color-primary, #0ea5e9);
  outline-offset: 2px;
}

/* Primary variant */
.load-more-button-primary {
  background-color: var(--color-primary, #0ea5e9);
  color: white;
}

.load-more-button-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark, #0284c7);
  transform: translateY(-1px);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.load-more-button-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Secondary variant */
.load-more-button-secondary {
  background-color: transparent;
  color: var(--color-text-primary, #1f2937);
  border-color: var(--color-border, #d1d5db);
}

.load-more-button-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-secondary, #f9fafb);
  border-color: var(--color-primary, #0ea5e9);
  color: var(--color-primary, #0ea5e9);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .load-more-button-secondary {
    color: var(--color-text-secondary, #e5e7eb);
    border-color: var(--color-border-dark, #4b5563);
  }

  .load-more-button-secondary:hover:not(:disabled) {
    background-color: rgba(14, 165, 233, 0.1);
  }
}

/* Spinner */
.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 9999px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Button text */
.button-text {
  font-weight: 600;
}

/* Error message */
.error-message {
  font-size: 0.875rem;
  color: var(--color-error, #ef4444);
  text-align: center;
  margin: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .load-more-button,
  .spinner {
    animation: none !important;
    transition: none !important;
  }

  .load-more-button:hover:not(:disabled) {
    transform: none !important;
  }
}
</style>
