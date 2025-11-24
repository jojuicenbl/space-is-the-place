<script setup lang="ts">
/**
 * Header component - Tailwind CSS version
 * Replaces: components/Header/Header.vue
 *
 * Features:
 * - Integrated search bar
 * - Title/subtitle slots
 * - Actions slot (filters, buttons, etc.)
 * - Responsive design
 * - Optional sticky behavior
 * - Background variants
 */

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { ref, watch } from 'vue'

interface Props {
  sticky?: boolean
  bordered?: boolean
  variant?: 'default' | 'gradient' | 'transparent'
  searchPlaceholder?: string
  searchValue?: string
  showSearch?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sticky: false,
  bordered: true,
  variant: 'default',
  searchPlaceholder: 'Rechercher...',
  searchValue: '',
  showSearch: true,
})

const emit = defineEmits<{
  'update:searchValue': [value: string]
  search: [value: string]
  clearSearch: []
}>()

const localSearchValue = ref(props.searchValue)

watch(() => props.searchValue, (newValue) => {
  localSearchValue.value = newValue
})

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  localSearchValue.value = value
  emit('update:searchValue', value)
  emit('search', value)
}

const clearSearch = () => {
  localSearchValue.value = ''
  emit('update:searchValue', '')
  emit('clearSearch')
}

const baseClasses = 'w-full transition-all duration-200'
const stickyClasses = props.sticky ? 'sticky top-0 z-40' : ''
const borderedClasses = props.bordered ? 'border-b border-gray-200 dark:border-gray-700' : ''

const variantClasses = {
  default: 'bg-white dark:bg-gray-900',
  gradient: 'bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800',
  transparent: 'bg-transparent backdrop-blur-lg bg-opacity-80',
}
</script>

<template>
  <header :class="[baseClasses, stickyClasses, borderedClasses, variantClasses[variant]]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Title section -->
      <div v-if="$slots.title || $slots.subtitle" class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <div v-if="$slots.title" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              <slot name="title" />
            </div>
            <div v-if="$slots.subtitle" class="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <slot name="subtitle" />
            </div>
          </div>

          <!-- Title actions (optional) -->
          <div v-if="$slots['title-actions']" class="flex items-center space-x-2">
            <slot name="title-actions" />
          </div>
        </div>
      </div>

      <!-- Search bar and filters section -->
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search input -->
        <div v-if="showSearch" class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              :value="localSearchValue"
              :placeholder="searchPlaceholder"
              class="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              @input="handleInput"
            />
            <button
              v-if="localSearchValue"
              class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 dark:hover:text-gray-200 text-gray-400 transition-colors"
              aria-label="Effacer la recherche"
              @click="clearSearch"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Actions slot (filters, buttons, etc.) -->
        <div v-if="$slots.actions" class="flex items-center space-x-2 flex-shrink-0">
          <slot name="actions" />
        </div>
      </div>

      <!-- Additional content slot -->
      <div v-if="$slots.content" class="mt-4">
        <slot name="content" />
      </div>
    </div>
  </header>
</template>
