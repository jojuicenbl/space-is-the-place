<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
<template>
  <div class="app">
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
<style>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>