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

import { computed, ref, onMounted, onUnmounted } from 'vue'
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

// Responsive delta: 1 on mobile, 2 on desktop
const isMobile = ref(window.innerWidth < 640)

const updateIsMobile = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})

const pages = computed(() => {
  const delta = isMobile.value ? 1 : 2
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
  <!-- Mobile Pagination (sm:hidden) -->
  <nav aria-label="Pagination" class="flex sm:hidden gap-3 justify-center items-center my-8 max-w-full px-4">
    <!-- Previous Button -->
    <button
      :disabled="currentPage === 1"
      :aria-label="currentPage === 1 ? 'First page, no previous' : 'Go to previous page'"
      class="min-w-[52px] min-h-[52px] px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
      @click="handlePageChange(currentPage - 1)"
    >
      <ChevronLeftIcon class="w-6 h-6" />
    </button>

    <!-- Page Info -->
    <span class="text-gray-700 dark:text-gray-300 text-base font-medium px-3 whitespace-nowrap">
      Page {{ currentPage }} / {{ totalPages }}
    </span>

    <!-- Next Button -->
    <button
      :disabled="currentPage === totalPages"
      :aria-label="currentPage === totalPages ? 'Last page, no next' : 'Go to next page'"
      class="min-w-[52px] min-h-[52px] px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
      @click="handlePageChange(currentPage + 1)"
    >
      <ChevronRightIcon class="w-6 h-6" />
    </button>
  </nav>

  <!-- Desktop Pagination (hidden sm:flex) -->
  <nav aria-label="Pagination" class="hidden sm:flex gap-2 justify-center my-8 max-w-full px-4">
    <!-- Previous Button -->
    <button
      :disabled="currentPage === 1"
      :aria-label="currentPage === 1 ? 'First page, no previous' : 'Go to previous page'"
      class="min-w-[44px] min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
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
        'min-w-[44px] min-h-[44px] px-3 py-2 rounded-lg transition-all duration-200 flex-shrink-0',
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
      class="min-w-[44px] min-h-[44px] px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
      @click="handlePageChange(currentPage + 1)"
    >
      <ChevronRightIcon class="w-5 h-5" />
    </button>
  </nav>
</template>
