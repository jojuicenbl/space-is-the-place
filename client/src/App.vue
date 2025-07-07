<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VApp } from 'vuetify/components'
</script>
<template>
  <v-app class="app">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
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
</style>
