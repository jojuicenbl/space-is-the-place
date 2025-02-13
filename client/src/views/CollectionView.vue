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
  <div class="mx-auto px-4" style="max-width: 1400px">
    <div class="d-flex flex-column align-center w-100">
      <BaseButton class="mb-8" @click="goBack">
        Go back
      </BaseButton>
      <MainTitle text="Collection" align="center" />
      <div class="d-flex justify-center w-100">
        <CollectionFilters 
          :folders="folders" 
          :current-folder="currentFolder" 
          :current-sort="currentSort"
          :current-sort-order="currentSortOrder" 
          @update:folder="currentFolder = $event"
          @update:sort="currentSort = $event" 
          @update:sort-order="currentSortOrder = $event" 
        />
      </div>
      <div v-if="isLoading" class="d-flex justify-center align-center min-height-300">
        loading
      </div>
      <div v-else-if="error" class="d-flex justify-center align-center min-height-300">
        {{ error }}
      </div>
      <template v-else>
        <div class="d-flex flex-wrap justify-center ga-6 mt-8 w-100">
          <VinylCard 
            v-for="release in releases" 
            :key="release.id" 
            :release="release" 
            class="vinyl-card-width"
          />
        </div>
        <div class="d-flex justify-center w-100 mt-8">
          <Pager 
            :current-page="currentPage" 
            :total-pages="totalPages" 
            :on-page-change="handlePageChange" 
          />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.vinyl-card-width {
  width: 200px;
}

@media (max-width: 768px) {
  .vinyl-card-width {
    width: 160px;
  }
}

.min-height-300 {
  min-height: 300px;
}
</style>