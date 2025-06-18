<script setup lang="ts">
import type { DiscogsFolder } from "@/services/discogsApi"
import type { SortField, SortOrder } from "@/services/discogsApi"
import type { CollectionRelease } from "@/types/models/Release"
import { ref, computed, watch } from "vue"
import { 
  VBtn, 
  VIcon, 
  VSelect, 
  VTextField,
  VCard,
  VCardText,
  VListItem
} from "vuetify/components"

const props = defineProps<{
  folders: DiscogsFolder[]
  currentFolder: number
  currentSort: SortField
  currentSortOrder: SortOrder
  releases: CollectionRelease[]
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: "update:folder", folderId: number): void
  (e: "update:sort", sort: SortField): void
  (e: "update:sortOrder", order: SortOrder): void
  (e: "search", query: string): void
}>()

// Reactive states
const searchQuery = ref(props.searchQuery || "")
const isSearchFocused = ref(false)

console.log(props.folders)
// Computed options for dropdowns
const folderOptions = computed(() => 
  props.folders
    .filter(folder => folder.id !== 1) // Exclude "Uncategorized" folder
    .map(folder => ({
      title: `${folder.name}`,
      value: folder.id,
      isAll: folder.id === 0 // Flag to identify "All" folder for styling
    }))
)



// Sort options with Date Added as default
const filterOptions = [
  { title: "Date Added", value: "added" },
  { title: "Artist", value: "artist" },
  { title: "Album", value: "title" }
] as const

// Handlers
const toggleSortOrder = () => {
  const newOrder: SortOrder = props.currentSortOrder === "asc" ? "desc" : "asc"
  emit("update:sortOrder", newOrder)
}

const handleFolderChange = (folderId: number) => {
  emit("update:folder", folderId)
}

const handleSortChange = (sort: SortField) => {
  emit("update:sort", sort)
}

// Watch for search query changes and emit search event
watch(searchQuery, (newQuery) => {
  emit("search", (newQuery || "").trim())
})

// Watch for prop changes to sync searchQuery
watch(() => props.searchQuery, (newSearchQuery) => {
  searchQuery.value = newSearchQuery || ""
})

// Computed sort button properties
const sortButtonProps = computed(() => ({
  icon: props.currentSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down",
  tooltip: props.currentSortOrder === "asc" ? "Ascending (A-Z)" : "Descending (Z-A)",
  color: props.currentSortOrder === "asc" ? "primary" : "secondary"
}))
</script>

<template>
  <VCard 
    class="filters-container mx-4 mb-4" 
    elevation="2"
    rounded="lg"
  >
    <VCardText class="pa-6">
      <div class="d-flex align-center ga-4 flex-wrap">
        <!-- Sort Order Toggle Button -->
        <div class="filter-item-toggle">
          <VBtn
            :icon="sortButtonProps.icon"
            :color="sortButtonProps.color"
            variant="outlined"
            size="large"
            @click="toggleSortOrder"
            class="sort-toggle-btn-new"
          >
            <VIcon :icon="sortButtonProps.icon" size="large" />
          </VBtn>
        </div>

        <!-- Genre/Folder Dropdown -->
        <div class="filter-item">
          <VSelect
            :model-value="currentFolder"
            :items="folderOptions"
            label="Genre"
            variant="outlined"
            density="comfortable"
            hide-details
            class="min-width-200"
            @update:model-value="handleFolderChange"
          >
            <template #prepend-inner>
              <VIcon icon="mdi-folder-music" size="small" />
            </template>
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps">
                <template #title>
                  <span :class="{ 'font-weight-bold': item.raw.isAll }">
                    {{ item.title }}
                  </span>
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <span :class="{ 'font-weight-bold': item.raw.isAll }">
                {{ item.title }}
              </span>
            </template>
          </VSelect>
        </div>

        <!-- Sort Field Dropdown -->
        <div class="filter-item">
          <VSelect
            :model-value="currentSort"
            :items="filterOptions"
            label="Sort by"
            variant="outlined"
            density="comfortable"
            hide-details
            class="min-width-180"
            @update:model-value="handleSortChange"
          >
            <template #prepend-inner>
              <VIcon icon="mdi-sort" size="small" />
            </template>
          </VSelect>
        </div>

        <!-- Search Bar -->
        <div class="filter-item-search flex-grow-1">
          <VTextField
            v-model="searchQuery"
            label="Search artists, albums, genres, styles..."
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            class="search-field"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
          >
            <template #prepend-inner>
              <VIcon 
                icon="mdi-magnify" 
                size="small"
                :color="isSearchFocused ? 'primary' : 'grey'"
              />
            </template>
          </VTextField>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.filters-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-item {
  min-width: 200px;
}

.filter-item-toggle {
  min-width: 56px; /* Match the button size */
}

.filter-item-search {
  min-width: 350px; /* Increased width for search bar */
}

.min-width-200 {
  min-width: 200px;
}

.min-width-180 {
  min-width: 180px;
}

.search-field {
  min-width: 350px; /* Increased width for search bar */
}

.sort-toggle-btn-new {
  height: 56px !important; /* Match dropdown height */
  width: 56px !important;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.3s ease;
}

.sort-toggle-btn-new:hover {
  transform: scale(1.05);
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-item {
    min-width: unset;
    width: 100%;
  }
  
  .filter-item-search {
    min-width: unset;
    width: 100%;
  }
  
  .filter-item-toggle {
    min-width: unset;
    width: auto;
  }
  
  .search-field {
    min-width: unset;
  }
  
  .d-flex.align-center.ga-4.flex-wrap {
    flex-direction: column;
    gap: 16px !important;
  }
}

/* Dark theme support */
@media (prefers-color-scheme: dark) {
  .filters-container {
    background: rgba(33, 33, 33, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

/* Custom vuetify overrides */
:deep(.v-field--variant-outlined) {
  --v-field-border-width: 2px;
  --v-theme-on-surface: rgba(0, 0, 0, 0.87);
}

:deep(.v-field--focused) {
  --v-field-border-width: 3px;
}

:deep(.v-btn--variant-tonal) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.v-text-field .v-field__input) {
  font-weight: 500;
}

:deep(.v-select .v-field__input) {
  font-weight: 500;
}
</style>
