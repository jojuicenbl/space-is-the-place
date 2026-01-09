import { ref } from 'vue'
import { defineStore } from 'pinia'

// Simplified store - demo mode only (OAuth disabled)
export const useUserStore = defineStore('user', () => {
  // State - always demo mode
  const collectionMode = ref<'demo'>('demo')
  const isInitialized = ref(true)

  // No-op actions kept for compatibility
  const loadUser = async () => {
    // No-op - always demo mode
  }

  const reset = () => {
    // No-op - always demo mode
  }

  return {
    // State
    collectionMode,
    isInitialized,
    // Compatibility - always false since OAuth is disabled
    discogsIsLinked: ref(false),
    discogsUsername: ref<string | null>(null),
    isLoading: ref(false),

    // Actions
    loadUser,
    reset
  }
})
