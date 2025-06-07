<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VApp } from 'vuetify/components'
</script>
<template>
  <v-app class="app">
    <main class="main-content">
      <RouterView />
    </main>
  </v-app>
</template>
<style>
.app {
  min-height: 100vh;
  background-color: var(--color-background) !important; /* Force the grey background */
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
}
</style>