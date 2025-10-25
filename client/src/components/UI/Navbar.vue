<script setup lang="ts">
/**
 * Navbar component - Tailwind CSS version
 * Replaces: components/Nav/AppNavbar.vue
 *
 * Features:
 * - Responsive design (mobile hamburger menu)
 * - Logo slot
 * - Navigation items with active states
 * - Actions slot (for buttons, user menu, etc.)
 * - Sticky option
 * - Transparent/solid variants
 */

import { ref } from 'vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  sticky?: boolean
  transparent?: boolean
  blurred?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  transparent: false,
  blurred: false,
})

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const baseClasses = 'w-full z-50 transition-all duration-200'
const stickyClasses = props.sticky ? 'sticky top-0' : ''
const transparentClasses = props.transparent
  ? 'bg-transparent'
  : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
const blurClasses = props.blurred ? 'backdrop-blur-lg bg-opacity-80' : ''
</script>

<template>
  <nav :class="[baseClasses, stickyClasses, transparentClasses, blurClasses]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center">
          <slot name="logo">
            <span class="text-xl font-bold text-gray-900 dark:text-white">Logo</span>
          </slot>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:space-x-8">
          <slot name="nav" />
        </div>

        <!-- Actions (buttons, user menu, etc.) -->
        <div class="hidden md:flex md:items-center md:space-x-4">
          <slot name="actions" />
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            type="button"
            @click="toggleMobileMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            aria-expanded="false"
          >
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!mobileMenuOpen" class="block h-6 w-6" />
            <XMarkIcon v-else class="block h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-800">
        <div class="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900">
          <slot name="mobile-nav" />
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
          <div class="px-2 space-y-1">
            <slot name="mobile-actions" />
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>
