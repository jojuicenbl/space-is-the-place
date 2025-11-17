/**
 * useResponsive Composable
 *
 * Detects current breakpoint and provides reactive state for responsive behavior.
 * Used to switch between infinite scroll (mobile) and pager (desktop) modes.
 *
 * Breakpoints (matching Tailwind defaults):
 * - mobile: < 768px (sm and below)
 * - desktop: >= 768px (md and above)
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

const MOBILE_BREAKPOINT = 768 // md breakpoint

export interface ResponsiveState {
  isMobile: Ref<boolean>
  isDesktop: Ref<boolean>
  width: Ref<number>
}

export function useResponsive(): ResponsiveState {
  const width = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 0)
  const isMobile = ref<boolean>(width.value < MOBILE_BREAKPOINT)
  const isDesktop = ref<boolean>(width.value >= MOBILE_BREAKPOINT)

  const updateBreakpoint = () => {
    width.value = window.innerWidth
    isMobile.value = width.value < MOBILE_BREAKPOINT
    isDesktop.value = width.value >= MOBILE_BREAKPOINT
  }

  onMounted(() => {
    // Set initial values
    updateBreakpoint()

    // Listen to resize events with debouncing
    let timeoutId: number | undefined

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = window.setTimeout(() => {
        updateBreakpoint()
      }, 150) as unknown as number
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })
  })

  return {
    isMobile,
    isDesktop,
    width
  }
}
