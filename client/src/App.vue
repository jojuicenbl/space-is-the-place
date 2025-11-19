<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import AppNavbar from '@/components/Nav/AppNavbar.vue'
import { useUserStore } from '@/stores/userStore'

const route = useRoute()
const userStore = useUserStore()

// Load user state on app startup
onMounted(async () => {
  await userStore.loadUser()
})

// Compute navbar visibility from route meta
const showNav = computed(() => route.meta.showNav === true)

// Get transition name from route meta or use default
const getTransitionName = () => {
  return (route.meta.pageTransition as string) || 'fade'
}
</script>
<template>
  <div class="app">
    <!-- Navbar with smooth appearance/hiding -->
    <Transition name="navbar" mode="out-in">
      <AppNavbar v-if="showNav" class="app-navbar" />
    </Transition>

    <div id="main-scroll" class="main-scroll" :class="{ 'with-navbar': showNav }">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition :name="getTransitionName()" mode="out-in">
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>
<style>
/* Timing constants - centralized for DRY */
:root {
  --transition-duration: 250ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

.main-scroll {
  height: 100vh;
  overflow-y: auto;
}

.main-scroll.with-navbar {
  padding-top: 80px;
}

.app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: var(--color-background);
}

/* ====================================
   Navbar Transitions
   ==================================== */
.navbar-enter-active,
.navbar-leave-active {
  transition: all var(--transition-duration) var(--transition-easing);
}

.navbar-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.navbar-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.navbar-enter-to,
.navbar-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* ====================================
   Page Transitions
   ==================================== */

/* Fade-slide transition for Welcome → Collection */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-duration) var(--transition-easing);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Simple fade for other routes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-duration) var(--transition-easing);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Legacy page transition (fallback) */
.page-enter-active,
.page-leave-active {
  transition: all var(--transition-duration) var(--transition-easing);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ====================================
   Reduced Motion Support
   ==================================== */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-duration: 0ms;
  }

  .navbar-enter-active,
  .navbar-leave-active,
  .fade-slide-enter-active,
  .fade-slide-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .page-enter-active,
  .page-leave-active {
    transition: none !important;
  }

  .navbar-enter-from,
  .navbar-leave-to,
  .fade-slide-enter-from,
  .fade-slide-leave-to,
  .page-enter-from,
  .page-leave-to {
    transform: none !important;
  }
}
</style>
