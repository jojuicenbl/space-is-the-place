<script setup lang="ts">
</script>
<template>
  <div>
    <div class="page-content">
      <div class="contact">
        <h1 class="page-title">CONTACT</h1>
        <p>Cette page sera complétée plus tard.</p>
      </div>
    </div>
  </div>
</template>
<style>
.page-content {
  padding-top: 80px;
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

.page-title {
  font-family: 'Rubik Mono One', monospace;
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 400;
  color: var(--color-heading);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  line-height: 1.1;
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
