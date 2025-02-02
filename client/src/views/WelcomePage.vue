<script setup lang="ts">
import MainTitle from "@/components/UI/MainTitle.vue"
import BaseButton from "@/components/UI/BaseButton.vue"
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToCollection = () => {
  router.push('/collection')
}
</script>
<template>
  <div class="welcome-container">
    <MainTitle text="Space Is The Place" align="center" />
    <p class="tagline">
      Space is the place where we can escape the limitations of our earthly
      existence
    </p>
    <BaseButton class="explore-button" @click="navigateToCollection">
      Explore Your Collection
    </BaseButton>
  </div>
</template>
<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tagline {
  text-align: center;
  margin: 2rem 0;
}

.explore-button {
  margin-top: 2rem;
}
</style>