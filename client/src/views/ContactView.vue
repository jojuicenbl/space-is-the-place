<script setup lang="ts">
import AppNavbar from "@/components/Nav/AppNavbar.vue"
</script>

<template>
  <div>
    <AppNavbar />
    <div class="page-content">
      <div class="contact">
        <h1>Contact</h1>
        <p>Cette page sera complétée plus tard.</p>
      </div>
    </div>
  </div>
</template>

<style>
.page-content {
  padding-top: 80px; /* Espace pour la navbar fixe */
}

@media (min-width: 1024px) {
  .contact {
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.contact {
  padding: 2rem;
  text-align: center;
}

.contact h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.contact p {
  font-size: 1.2rem;
  color: #666;
}
</style>
