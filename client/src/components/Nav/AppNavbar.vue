<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const goToHome = () => {
  router.push('/')
}

const goToCollection = () => {
  router.push('/collection')
}

const goToAbout = () => {
  router.push('/about')
}

const goToContact = () => {
  router.push('/contact')
}

const isCurrentRoute = (routeName: string) => {
  return route.name === routeName
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
      <div class="flex items-center">
        <button
          class="p-1 sm:p-2 rounded-lg transition-transform duration-200 hover:scale-105"
          @click="goToHome"
        >
          <img
            src="/space-is-the-place-logo.png"
            alt="Space Is The Place Logo"
            class="h-8 sm:h-8 md:h-[65px] w-auto object-contain shrink-0"
          />
        </button>
      </div>
      <div class="flex items-center">
        <div class="flex gap-1 sm:gap-2 md:gap-4 lg:gap-8 items-center font-['Inter',system-ui,sans-serif]">
          <button
            class="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
            :class="isCurrentRoute('collection')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToCollection"
          >
            Collection
          </button>
          <button
            class="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
            :class="isCurrentRoute('about')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToAbout"
          >
            About
          </button>
          <button
            class="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all duration-200"
            :class="isCurrentRoute('contact')
              ? 'text-gray-900 dark:text-gray-100 bg-black/10 dark:bg-white/10'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5'"
            @click="goToContact"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.navbar {
  background-color: color-mix(in srgb, var(--color-background) 70%, transparent);
}
</style>
