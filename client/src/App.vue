<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { VApp } from 'vuetify/components'
import AppNavbar from '@/components/Nav/AppNavbar.vue'
// import { ref, watch } from 'vue'

const route = useRoute()
// const showNavbar = ref(false)

// watch(
//   () => route.name,
//   () => {
//     // Cache la navbar lors du changement de page
//     showNavbar.value = false
//   }
// )

</script>
<template>
  <v-app class="app">
    <AppNavbar v-show="route.name !== 'welcome'" class="app-navbar" />
    <div id="main-scroll" class="main-scroll" :class="{ 'with-navbar': route.name !== 'welcome' }">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </v-app>
</template>
<style>
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
  background-color: var(--color-background) !important;
  /* Force the grey background */
}

/* Reset any default Vuetify margins/padding */
.v-application {
  margin: 0 !important;
  padding: 0 !important;
}

/* Transitions de page smooth */
.page-enter-active,
.page-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.app-navbar {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}

.app-navbar[style*="display: none"] {
  opacity: 0;
  pointer-events: none;
}

.app-navbar:not([style*="display: none"]) {
  opacity: 1;
}

/* .navbar-fade-enter-active,
.navbar-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar-fade-enter-from,
.navbar-fade-leave-to {
  opacity: 0;
}

.navbar-fade-enter-active {
  transition-delay: 0.2s;
} */
</style>
