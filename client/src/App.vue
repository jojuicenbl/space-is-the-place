<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VApp } from 'vuetify/components'
</script>
<template>
  <v-app>
    <div class="app">
      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </v-app>
</template>
<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  /* padding: 1rem; */
}
</style>