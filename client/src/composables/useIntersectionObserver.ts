/**
 * useIntersectionObserver Composable
 *
 * Provides IntersectionObserver functionality for infinite scroll.
 * Observes a sentinel element and triggers callback when it becomes visible.
 *
 * Features:
 * - Configurable root margin (triggers load before reaching bottom)
 * - Configurable threshold
 * - Automatic cleanup on unmount
 * - Guards against multiple simultaneous triggers
 */

import { onUnmounted, type Ref } from 'vue'

export interface IntersectionObserverOptions {
  rootMargin?: string // e.g., '300px' to trigger 300px before reaching the sentinel
  threshold?: number // 0.0 to 1.0
  root?: Element | null
}

export interface IntersectionObserverComposable {
  observe: (element: Element) => void
  unobserve: (element: Element) => void
  disconnect: () => void
}

export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverOptions = {}
): IntersectionObserverComposable {
  const {
    rootMargin = '600px', // Trigger 600px before reaching the sentinel
    threshold = 0.1,
    root = null
  } = options

  let isIntersecting = false

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Only trigger when entering viewport (not when leaving)
        if (entry.isIntersecting && !isIntersecting) {
          isIntersecting = true
          callback()

          // Reset flag after callback completes
          setTimeout(() => {
            isIntersecting = false
          }, 300)
        }
      })
    },
    {
      root,
      rootMargin,
      threshold
    }
  )

  const observe = (element: Element) => {
    observer.observe(element)
  }

  const unobserve = (element: Element) => {
    observer.unobserve(element)
  }

  const disconnect = () => {
    observer.disconnect()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    observe,
    unobserve,
    disconnect
  }
}
