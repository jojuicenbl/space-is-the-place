<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isMobileMenuOpen = ref(false)
const isLoggingOut = ref(false)

const goToHome = () => {
  router.push('/collection')
  isMobileMenuOpen.value = false
}

const goToCollection = () => {
  router.push('/collection')
  isMobileMenuOpen.value = false
}

const goToAbout = () => {
  router.push('/about')
  isMobileMenuOpen.value = false
}

const goToContact = () => {
  router.push('/contact')
  isMobileMenuOpen.value = false
}

const isCurrentRoute = (routeName: string) => {
  return route.name === routeName
}

const handleLogout = async () => {
  if (isLoggingOut.value) return

  isLoggingOut.value = true
  try {
    await userStore.disconnect()
    isMobileMenuOpen.value = false
    // Navigate to collection in demo mode
    router.push('/collection?mode=demo')
  } catch (error) {
    console.error('Logout failed:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const hasScrolled = ref(false)
let scrollTarget: HTMLElement | null = null

const handleScroll = () => {
  if (scrollTarget) {
    hasScrolled.value = scrollTarget.scrollTop > 0
  }
}

onMounted(() => {
  scrollTarget = document.getElementById('main-scroll')
  if (scrollTarget) {
    scrollTarget.addEventListener('scroll', handleScroll)
    handleScroll()
  }
})

onUnmounted(() => {
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', handleScroll)
  }
})
</script>
<template>
  <nav
    class="navbar fixed top-0 left-0 right-0 z-[1000] backdrop-blur-lg transition-all duration-200 border-b-[1.5px] border-transparent"
    :class="{ 'border-gray-200/50 dark:border-gray-700/50': hasScrolled }"
  >
    <div class="flex items-center justify-between max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 h-[50px] sm:h-[60px]">
      <!-- Logo -->
      <div class="flex items-center">
        <button
          class="p-1 sm:p-2 rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95"
          @click="goToHome"
        >
          <img
            src="/space-is-the-place-logo.png"
            alt="Space Is The Place Logo"
            class="h-[45px] sm:h-[50px] md:h-[65px] w-auto object-contain shrink-0"
          />
        </button>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-1 lg:gap-2">
        <div class="flex gap-1 lg:gap-4 items-center font-['Inter',system-ui,sans-serif]">
          <button
            class="nav-link px-3 py-2 lg:px-4 rounded-lg text-sm lg:text-base font-medium transition-all duration-200"
            :class="isCurrentRoute('collection')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToCollection"
          >
            Collection
          </button>
          <button
            class="nav-link px-3 py-2 lg:px-4 rounded-lg text-sm lg:text-base font-medium transition-all duration-200"
            :class="isCurrentRoute('about')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToAbout"
          >
            About
          </button>
          <button
            class="nav-link px-3 py-2 lg:px-4 rounded-lg text-sm lg:text-base font-medium transition-all duration-200"
            :class="isCurrentRoute('contact')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToContact"
          >
            Contact
          </button>
        </div>

        <!-- Logout Button (Desktop) -->
        <button
          v-if="userStore.discogsIsLinked"
          class="logout-btn ml-3 lg:ml-6 px-4 py-2 lg:px-5 rounded-full text-sm lg:text-base font-medium transition-all duration-300 border-2 border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400 hover:border-red-500 hover:bg-red-500/15 hover:scale-105 active:scale-95"
          :disabled="isLoggingOut"
          @click="handleLogout"
        >
          {{ isLoggingOut ? 'Logging out...' : 'Log Out' }}
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
        @click="toggleMobileMenu"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="!isMobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu Dropdown -->
    <Transition name="mobile-menu">
      <div
        v-if="isMobileMenuOpen"
        class="md:hidden border-t border-gray-200/50 dark:border-gray-700/50"
      >
        <div class="flex flex-col p-3 gap-1 font-['Inter',system-ui,sans-serif]">
          <button
            class="nav-link-mobile w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            :class="isCurrentRoute('collection')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToCollection"
          >
            Collection
          </button>
          <button
            class="nav-link-mobile w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            :class="isCurrentRoute('about')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToAbout"
          >
            About
          </button>
          <button
            class="nav-link-mobile w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200"
            :class="isCurrentRoute('contact')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToContact"
          >
            Contact
          </button>

          <!-- Logout Button (Mobile) -->
          <button
            v-if="userStore.discogsIsLinked"
            class="logout-btn-mobile w-full text-center px-4 py-3 mt-3 rounded-full text-base font-medium transition-all duration-300 border-2 border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400 hover:border-red-500 hover:bg-red-500/15 active:scale-95"
            :disabled="isLoggingOut"
            @click="handleLogout"
          >
            {{ isLoggingOut ? 'Logging out...' : 'Log Out' }}
          </button>
        </div>
      </div>
    </Transition>
  </nav>
</template>
<style scoped>
.navbar {
  background-color: color-mix(in srgb, var(--color-background) 85%, transparent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Navigation links hover effects */
.nav-link {
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 2px;
  background: currentColor;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover::after {
  transform: translateX(-50%) scaleX(1);
  opacity: 0.3;
}

/* Logout button styles */
.logout-btn {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
}

.logout-btn:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Mobile menu transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Mobile nav links */
.nav-link-mobile {
  letter-spacing: 0.01em;
}

/* Mobile logout button */
.logout-btn-mobile {
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.2);
}

.logout-btn-mobile:hover {
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.logout-btn-mobile:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}
</style>
