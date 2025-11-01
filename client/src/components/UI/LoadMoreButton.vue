<script setup lang="ts">
/**
 * LoadMoreButton component - Mobile only
 *
 * Features:
 * - Load more button for mobile pagination
 * - Loading state with spinner
 * - Error state with retry button
 * - ARIA live region for accessibility
 * - Tailwind CSS styling
 */

import { ref, watch } from 'vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  isLoading: boolean
  hasMore: boolean
  error: string | null
  onLoadMore: () => void
  onRetry: () => void
}>()

// Track newly loaded items for ARIA announcement
const ariaMessage = ref('')
const lastLoadedCount = ref(0)

// Update ARIA message when loading completes
watch(() => props.isLoading, (newVal, oldVal) => {
  if (oldVal && !newVal && !props.error) {
    // Loading just finished successfully
    const newItems = 48 // Default page size
    lastLoadedCount.value = newItems
    ariaMessage.value = `${newItems} nouveaux éléments chargés`

    // Clear message after announcement
    setTimeout(() => {
      ariaMessage.value = ''
    }, 3000)
  }
})
</script>

<template>
  <div class="load-more-container">
    <!-- ARIA Live Region for announcements -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ ariaMessage }}
    </div>

    <!-- Error State -->
    <div v-if="error" class="flex flex-col items-center gap-3">
      <p class="text-sm text-red-600 dark:text-red-400 text-center">
        {{ error }}
      </p>
      <button
        type="button"
        class="load-more-button bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        @click="onRetry"
      >
        <ArrowPathIcon class="w-5 h-5 mr-2" />
        Réessayer
      </button>
    </div>

    <!-- Loading State -->
    <button
      v-else-if="isLoading"
      type="button"
      disabled
      class="load-more-button"
      aria-label="Chargement en cours"
    >
      <svg
        class="animate-spin h-5 w-5 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Chargement...
    </button>

    <!-- Default State: Load More -->
    <button
      v-else-if="hasMore"
      type="button"
      class="load-more-button"
      aria-label="Charger plus d'albums"
      @click="onLoadMore"
    >
      Voir plus
    </button>

    <!-- End of list message -->
    <div
      v-else
      class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
    >
      Vous avez atteint la fin de la liste
    </div>
  </div>
</template>

<style scoped>
.load-more-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
}

.load-more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background-color: var(--color-primary-600, #2563eb);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
}

.load-more-button:hover:not(:disabled) {
  background-color: var(--color-primary-700, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.load-more-button:active:not(:disabled) {
  transform: translateY(0);
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Screen reader only */
.sr-only {
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

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .load-more-button {
    background-color: var(--color-primary-700, #1d4ed8);
  }

  .load-more-button:hover:not(:disabled) {
    background-color: var(--color-primary-800, #1e40af);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .load-more-button {
    transition: none;
  }

  .load-more-button:hover:not(:disabled) {
    transform: none;
  }

  .animate-spin {
    animation: none;
  }
}
</style>
