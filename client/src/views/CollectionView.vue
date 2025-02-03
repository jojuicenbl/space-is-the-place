<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getUserCollection } from '../services/discogsApi'
import VinylCard from '../components/VinylCard.vue'
// import LoadingSpinner from '@/components/UI/LoadingSpinner.vue'
import MainTitle from "@/components/UI/MainTitle.vue"
import type { CollectionRelease } from '@/types/models/Release'
import { useRouter } from 'vue-router'
import BaseButton from "@/components/UI/BaseButton.vue"
import Pager from '@/components/UI/Pager.vue'
import CollectionFilters from '@/components/CollectionFilters.vue'
import type { DiscogsFolder, SortField, SortOrder } from '@/services/discogsApi'
import { getUserFolders } from '@/services/discogsApi'

const releases = ref<CollectionRelease[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const username = import.meta.env.VITE_USERNAME
const currentPage = ref(1)
const totalPages = ref(1)
const folders = ref<DiscogsFolder[]>([])
const currentFolder = ref(0)
const currentSort = ref<SortField>('added')
const currentSortOrder = ref<SortOrder>('desc')

const router = useRouter()

const goBack = () => {
  router.back()
}

const fetchFolders = async () => {
  try {
    const data = await getUserFolders(username)
    folders.value = data.folders
  } catch (err) {
    console.error('Error loading folders:', err)
  }
}

const fetchCollection = async (page: number) => {
  isLoading.value = true
  try {
    const data = await getUserCollection(username, {
      page,
      folderId: currentFolder.value,
      sort: currentSort.value,
      sortOrder: currentSortOrder.value
    })
    releases.value = data.releases
    totalPages.value = Math.ceil(data.pagination.items / data.pagination.per_page)
    currentPage.value = page
  } catch (err) {
    error.value = 'Failed to load your collection'
    console.error('Error loading collection:', err)
  } finally {
    isLoading.value = false
  }
}

const handlePageChange = (page: number) => {
  fetchCollection(page)
}

watch([currentFolder, currentSort, currentSortOrder], () => {
  fetchCollection(1)
})

onMounted(async () => {
  await fetchFolders()
  await fetchCollection(1)
})
</script>
<template>
  <div class="collection-container">
    <BaseButton class="go-back-button" @click="goBack">
      Go back
    </BaseButton>
    <MainTitle text="Collection" align="left" />
    <div class="vinyl-grid-container">
      <CollectionFilters :folders="folders" :current-folder="currentFolder" :current-sort="currentSort"
        :current-sort-order="currentSortOrder" @update:folder="currentFolder = $event"
        @update:sort="currentSort = $event" @update:sort-order="currentSortOrder = $event" />
      <div v-if="isLoading" class="loading-state">
        loading
      </div>
      <div v-else-if="error" class="error-state">
        {{ error }}
      </div>
      <template v-else>
        <div class="vinyl-grid">
          <VinylCard v-for="release in releases" :key="release.id" :release="release" />
        </div>
        <Pager :current-page="currentPage" :total-pages="totalPages" :on-page-change="handlePageChange" />
      </template>
    </div>
  </div>
</template>
<style scoped>
.collection-container {
  max-width: 1400px;
  margin: 0 auto;
}

.vinyl-grid-container {
  padding: 0 2rem;
}

.vinyl-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
}

.vinyl-grid :deep(.vinyl-card) {
  width: 200px;
  flex-grow: 0;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .vinyl-grid {
    justify-content: center;
    gap: 1rem;
  }

  .vinyl-grid :deep(.vinyl-card) {
    width: 160px;
  }
}

.loading-state,
.error-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.go-back-button {
  margin-bottom: 2rem;
}
</style>