<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserCollection } from '../services/discogsApi'
import VinylCard from '../components/VinylCard.vue'
// import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import MainTitle from "@/components/UI/MainTitle.vue"
import type { CollectionRelease, CollectionResponse } from '@/types/models/Release'

const releases = ref<CollectionRelease[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const username = import.meta.env.VITE_USERNAME

onMounted(async () => {
  try {
    const data = await getUserCollection(username) as CollectionResponse
    releases.value = data.releases
  } catch (err) {
    error.value = 'Failed to load your collection'
    console.error('Error loading collection:', err)
  } finally {
    isLoading.value = false
  }
})
</script>
<template>
  <div class="collection-container">
    <MainTitle text="My Collection" align="left" />
    <div v-if="isLoading" class="loading-state">
      <!-- <LoadingSpinner /> -->
      loading
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else class="vinyl-grid">
      <VinylCard v-for="release in releases" :key="release.id" :release="release" />
    </div>
  </div>
</template>
<style scoped>
.collection-container {
  padding: 2rem;
}

.vinyl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>