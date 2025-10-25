<script setup lang="ts">
/**
 * Pager component - Tailwind CSS version
 * Migré de: components/UI/Pager.vue (Vuetify)
 *
 * Migration notes:
 * - Remplace v-icon par Heroicons (ChevronLeftIcon, ChevronRightIcon)
 * - Remplace <style scoped> par classes Tailwind utility
 * - Améliore accessibilité (aria-label, aria-current)
 * - Ajoute dark mode support
 * - Préserve algorithme de pagination avec "..."
 */

import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}>()

const handlePageChange = (page: number) => {
  // Let the parent handle the scroll and transitions
  props.onPageChange(page)
}

const pages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= props.totalPages; i++) {
    if (
      i === 1 ||
      i === props.totalPages ||
      (i >= props.currentPage - delta && i <= props.currentPage + delta)
    ) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})
</script>

<template>
  <nav aria-label="Pagination" class="flex gap-2 justify-center my-8">
    <!-- Previous Button -->
    <button
      :disabled="currentPage === 1"
      :aria-label="currentPage === 1 ? 'First page, no previous' : 'Go to previous page'"
      class="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      @click="handlePageChange(currentPage - 1)"
    >
      <ChevronLeftIcon class="w-5 h-5" />
    </button>

    <!-- Page Numbers -->
    <button
      v-for="page in pages"
      :key="page"
      :disabled="page === '...'"
      :aria-label="page === '...' ? 'More pages' : `Go to page ${page}`"
      :aria-current="page === currentPage ? 'page' : undefined"
      :class="[
        'px-4 py-2 rounded-lg transition-all duration-200',
        page === '...'
          ? 'border-none bg-transparent text-gray-400 dark:text-gray-500 cursor-default'
          : page === currentPage
            ? 'bg-primary-600 text-white border border-primary-600 font-semibold'
            : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      ]"
      @click="page !== '...' && handlePageChange(Number(page))"
    >
      {{ page }}
    </button>

    <!-- Next Button -->
    <button
      :disabled="currentPage === totalPages"
      :aria-label="currentPage === totalPages ? 'Last page, no next' : 'Go to next page'"
      class="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      @click="handlePageChange(currentPage + 1)"
    >
      <ChevronRightIcon class="w-5 h-5" />
    </button>
  </nav>
</template>
