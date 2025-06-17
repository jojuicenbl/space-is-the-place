<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import { getUserCollection, prefetchNextPage } from "../services/discogsApi"
import VinylCard from "../components/VinylCard.vue"
import MainTitle from "@/components/UI/MainTitle.vue"
import type { CollectionRelease } from "@/types/models/Release"

import Pager from "@/components/UI/Pager.vue"
import CollectionFilters from "@/components/CollectionFilters.vue"
import type { DiscogsFolder, SortField, SortOrder } from "@/services/discogsApi"
import { getUserFolders } from "@/services/discogsApi"
import { VSkeletonLoader } from "vuetify/components"
import AppNavbar from "@/components/Nav/AppNavbar.vue"

const releases = ref<CollectionRelease[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const username = import.meta.env.VITE_USERNAME
const currentPage = ref(1)
const totalPages = ref(1)
const folders = ref<DiscogsFolder[]>([])
const currentFolder = ref(0)
const currentSort = ref<SortField>("added")
const currentSortOrder = ref<SortOrder>("desc")
const isFiltersVisible = ref(true)
const isContentVisible = ref(true)
const isPagerVisible = ref(true)

const fetchFolders = async () => {
  try {
    const data = await getUserFolders(username)
    folders.value = data.folders
  } catch (err) {
    console.error("Error loading folders:", err)
  }
}

const fetchCollection = async (page: number) => {
  isLoading.value = true
  try {
    const data = await getUserCollection(username, {
      page,
      folderId: currentFolder.value,
      sort: currentSort.value,
      sortOrder: currentSortOrder.value,
    })
    releases.value = data.releases
    totalPages.value = Math.ceil(
      data.pagination.items / data.pagination.per_page,
    )
    currentPage.value = page

    // prefetch next page if not on last page
    if (page < totalPages.value) {
      prefetchNextPage(username, page, {
        folderId: currentFolder.value,
        sort: currentSort.value,
        sortOrder: currentSortOrder.value,
      })
    }
  } catch (err) {
    error.value = "Failed to load your collection"
    console.error("Error loading collection:", err)
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
  isFiltersVisible.value = false
  isContentVisible.value = true
  isPagerVisible.value = false

  await fetchFolders()
  await fetchCollection(1)

  // show outer components with slight delay
  setTimeout(() => {
    isFiltersVisible.value = true
    isPagerVisible.value = true
  }, 100)
})
</script>
<template>
  <div>
    <AppNavbar />
    <div class="page-content">
      <div class="mx-auto collection-container">
        <div class="d-flex flex-column align-center w-100">
          <MainTitle text="Collection" align="center" />
          <!-- add fade transition for filters -->
          <Transition name="fade">
            <div v-show="isFiltersVisible" class="d-flex justify-center w-100">
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
          </Transition>
          <div
            v-show="isContentVisible"
            style="
              transition:
                opacity 400ms,
                transform 400ms;
              transform: none;
              opacity: 1;
            "
          >
            <Transition name="fade" mode="out-in">
              <div
                v-if="isLoading"
                class="d-flex flex-wrap justify-center ga-3 mt-4"
              >
                <v-skeleton-loader
                  v-for="n in 12"
                  :key="n"
                  class="vinyl-card-width"
                  type="image"
                  :loading="true"
                ></v-skeleton-loader>
              </div>
              <div
                v-else-if="error"
                class="d-flex justify-center align-center min-height-300"
              >
                {{ error }}
              </div>
              <TransitionGroup
                v-else
                name="card-list"
                tag="div"
                class="d-flex flex-wrap justify-center ga-3 mt-4 w-100"
              >
                <VinylCard
                  v-for="release in releases"
                  :key="release.id"
                  :release="release"
                  class="vinyl-card-width"
                />
              </TransitionGroup>
            </Transition>
          </div>
          <Transition name="fade">
            <div
              v-show="isPagerVisible"
              class="d-flex justify-center w-100 mt-8"
            >
              <Pager
                :current-page="currentPage"
                :total-pages="totalPages"
                :on-page-change="handlePageChange"
              />
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.page-content {
  padding-top: 80px; /* Espace pour la navbar fixe */
}

.collection-container {
  max-width: 1400px;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 1360px) {
  .collection-container {
    padding-left: 8px;
    padding-right: 8px;
  }
}

.vinyl-card-width {
  width: 200px;
}

.vinyl-card {
  transition: opacity 0.1s ease-in-out;
}

.vinyl-card:hover {
  opacity: 0.8;
}

.min-height-300 {
  min-height: 300px;
}

/* Add transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Card list transitions */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.5s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Ensure items maintain their space during transition */
.card-list-move {
  transition: transform 0.5s ease;
}

/* Add some custom styling for the skeleton loaders */
:deep(.v-skeleton-loader) {
  border-radius: 4px;
}

:deep(.v-skeleton-loader__image) {
  height: 200px !important;
  border-radius: 4px;
}

:deep(.v-skeleton-loader__text) {
  max-width: 90% !important;
  margin: 8px auto !important;
}
</style>
