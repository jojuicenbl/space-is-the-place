<script setup lang="ts">
/**
 * BackToTop Component
 *
 * Floating button that appears after scrolling down.
 * Scrolls back to top when clicked.
 *
 * Features:
 * - Shows after scrolling ~2 screens (configurable threshold)
 * - Smooth scroll animation
 * - Fixed position in bottom right
 * - Accessible (ARIA labels, keyboard support)
 * - Dark mode support
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronUpIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  threshold?: number // Show button after scrolling this many pixels (default: 800px)
  scrollTarget?: string // ID of the element to scroll (default: 'main-scroll')
}>()

const isVisible = ref(false)

const threshold = props.threshold ?? 800
const scrollTarget = props.scrollTarget ?? 'main-scroll'

const handleScroll = () => {
  const target = document.getElementById(scrollTarget)
  if (target) {
    isVisible.value = target.scrollTop > threshold
  }
}

const scrollToTop = () => {
  const target = document.getElementById(scrollTarget)
  if (target) {
    target.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  const target = document.getElementById(scrollTarget)
  if (target) {
    target.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const target = document.getElementById(scrollTarget)
  if (target) {
    target.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <Transition name="fade-scale">
    <button
      v-if="isVisible"
      type="button"
      aria-label="Back to top"
      class="back-to-top-button"
      @click="scrollToTop"
    >
      <ChevronUpIcon class="w-6 h-6" />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top-button {
  /* Fixed positioning */
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;

  /* Size and shape */
  width: 3rem;
  height: 3rem;
  border-radius: 9999px; /* Full circle */

  /* Colors */
  background-color: var(--color-primary, #0ea5e9);
  color: white;

  /* Shadow */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Interaction */
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* Border */
  border: none;
  outline: none;
}

.back-to-top-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background-color: var(--color-primary-dark, #0284c7);
}

.back-to-top-button:active {
  transform: translateY(0);
}

.back-to-top-button:focus-visible {
  outline: 2px solid var(--color-primary, #0ea5e9);
  outline-offset: 2px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .back-to-top-button {
    background-color: var(--color-primary, #0ea5e9);
  }

  .back-to-top-button:hover {
    background-color: var(--color-primary-light, #38bdf8);
  }
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .back-to-top-button,
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: none !important;
  }

  .back-to-top-button:hover {
    transform: none !important;
  }

  .fade-scale-enter-from,
  .fade-scale-leave-to {
    transform: none !important;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .back-to-top-button {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 2.75rem;
    height: 2.75rem;
  }
}
</style>
