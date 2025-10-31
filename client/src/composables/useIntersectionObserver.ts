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

  console.log('[useIntersectionObserver] 🔭 Creating observer with options:', {
    rootMargin,
    threshold,
    hasRoot: !!root
  })

  const observer = new IntersectionObserver(
    (entries) => {
      console.log(`[useIntersectionObserver] 📊 Received ${entries.length} entries`)
      entries.forEach((entry) => {
        console.log('[useIntersectionObserver] Entry details:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          targetElement: entry.target,
          alreadyIntersecting: isIntersecting
        })

        // Only trigger when entering viewport (not when leaving)
        if (entry.isIntersecting && !isIntersecting) {
          console.log('[useIntersectionObserver] ✅ Triggering callback (element entered viewport)')
          isIntersecting = true
          callback()

          // Reset flag after callback completes
          setTimeout(() => {
            console.log('[useIntersectionObserver] 🔄 Resetting intersection flag')
            isIntersecting = false
          }, 300)
        } else if (!entry.isIntersecting && isIntersecting) {
          console.log('[useIntersectionObserver] ℹ️ Element left viewport')
        } else if (entry.isIntersecting && isIntersecting) {
          console.log('[useIntersectionObserver] ⏸️ Still intersecting, waiting for reset')
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
    console.log('[useIntersectionObserver] 👀 Starting to observe element:', element)
    observer.observe(element)
  }

  const unobserve = (element: Element) => {
    console.log('[useIntersectionObserver] 🚫 Stopped observing element:', element)
    observer.unobserve(element)
  }

  const disconnect = () => {
    console.log('[useIntersectionObserver] 🔌 Disconnecting observer')
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
