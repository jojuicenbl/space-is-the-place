<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import AppNavbar from '@/components/Nav/AppNavbar.vue'

const route = useRoute()

// Déclaration du type global pour Starfield
declare global {
  interface Window {
    Starfield: any
  }
}

// Initialiser le starfield après le montage
onMounted(() => {
  // Attendre que le script soit chargé
  const initStarfield = () => {
    if (window.Starfield) {
      try {
        window.Starfield.setup({
          auto: false,  // Mode manuel (pas besoin d'élément origin)
          numStars: 400,
          baseSpeed: 1,
          trailLength: 0.8,
          starColor: 'rgb(255, 255, 255)',
          canvasColor: 'rgb(0, 0, 0)',
          hueJitter: 0,
          maxAcceleration: 10,
          accelerationRate: 0.2,
          decelerationRate: 0.2,
          minSpawnRadius: 80,
          maxSpawnRadius: 500
        })

        // Activer l'accélération pour un mouvement constant
        window.Starfield.setAccelerate(true)
      } catch (error) {
        console.error('Error initializing starfield:', error)
      }
    } else {
      // Réessayer si le script n'est pas encore chargé
      setTimeout(initStarfield, 100)
    }
  }

  // Démarrer l'initialisation avec un petit délai
  setTimeout(initStarfield, 100)
})
</script>
<template>
  <div class="app">
    <!-- Container starfield -->
    <div class="starfield"></div>

    <AppNavbar v-show="route.name !== 'welcome'" class="app-navbar" />
    <div id="main-scroll" class="main-scroll" :class="{ 'with-navbar': route.name !== 'welcome' }">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
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
  position: relative;
  z-index: 10;
}

.main-scroll.with-navbar {
  padding-top: 80px;
}

.app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: transparent;
  position: relative;
}

/* Container starfield - arrière-plan fixe */
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

/* Force le canvas du starfield à rester en arrière-plan */
.starfield canvas {
  z-index: -1 !important;
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
  position: relative;
  z-index: 100;
}

.app-navbar[style*="display: none"] {
  opacity: 0;
  pointer-events: none;
}

.app-navbar:not([style*="display: none"]) {
  opacity: 1;
}
</style>
