import { ref, onMounted, onUnmounted } from 'vue'

/**
 * responsive utils
 */

// mobile breakpoint (CSS @media min-width: 768px)
const MOBILE_BREAKPOINT = 768

/**
 * returning true if screen is mobile size
 */
export function isMobile(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

/**
 * Composable Vue pour la détection responsive reactive
 */
export function useResponsive() {
  const isMobileView = ref(isMobile())

  const updateView = () => {
    isMobileView.value = isMobile()
  }

  onMounted(() => {
    window.addEventListener('resize', updateView)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateView)
  })

  return {
    isMobileView,
    isMobile: () => isMobileView.value
  }
}

export function isTablet(): boolean {
  return window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < 1200
}

export function isDesktop(): boolean {
  return window.innerWidth >= MOBILE_BREAKPOINT
}
