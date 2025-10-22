<script setup lang="ts">
/**
 * CollectionFilters component - Tailwind CSS version
 * Migré de: components/CollectionFilters.vue (Vuetify)
 *
 * Migration notes:
 * - Remplace v-select par Select.vue (nouveau composant Tailwind)
 * - Remplace v-text-field par Input.vue
 * - Remplace v-btn par Button.vue
 * - Remplace v-card par Card.vue
 * - Remplace mdi icons par Heroicons
 * - Préserve toutes les fonctionnalités (folder, sort, search)
 */

import type { DiscogsFolder } from '@/services/discogsApi'
import type { SortField, SortOrder } from '@/services/discogsApi'
import type { CollectionRelease } from '@/types/models/Release'
import { ref, computed, watch } from 'vue'
import Card from '@/components/ui-tailwind/Card.vue'
import Select, { type SelectOption } from '@/components/ui-tailwind/Select.vue'
import Input from '@/components/ui-tailwind/Input.vue'
import Button from '@/components/ui-tailwind/Button.vue'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  FolderIcon,
  BarsArrowUpIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  folders: DiscogsFolder[]
  currentFolder: number
  currentSort: SortField
  currentSortOrder: SortOrder
  releases: CollectionRelease[]
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'update:folder', folderId: number): void
  (e: 'update:sort', sort: SortField): void
  (e: 'update:sortOrder', order: SortOrder): void
  (e: 'search', query: string): void
}>()

// Reactive states
const searchQuery = ref(props.searchQuery || '')
const isSearchFocused = ref(false)

// Computed options for dropdowns (adapted for Select component)
const folderOptions = computed(() =>
  props.folders
    .filter(folder => folder.id !== 1) // Exclude "Uncategorized" folder
    .map(folder => ({
      label: folder.name,
      value: folder.id
    }))
)

// Sort options with Date Added as default (adapted for Select component)
const sortOptions: SelectOption[] = [
  { label: 'Date Added', value: 'added' },
  { label: 'Artist', value: 'artist' },
  { label: 'Album', value: 'title' }
]

// Handlers
const toggleSortOrder = () => {
  const newOrder: SortOrder = props.currentSortOrder === 'asc' ? 'desc' : 'asc'
  emit('update:sortOrder', newOrder)
}

const handleFolderChange = (value: string | number) => {
  emit('update:folder', Number(value))
}

const handleSortChange = (value: string | number) => {
  emit('update:sort', value as SortField)
}

// Watch for search query changes and emit search event
watch(searchQuery, newQuery => {
  emit('search', (newQuery || '').trim())
})

// Watch for prop changes to sync searchQuery
watch(
  () => props.searchQuery,
  newSearchQuery => {
    searchQuery.value = newSearchQuery || ''
  }
)

// Computed sort button properties (adapted for Tailwind)
const sortButtonVariant = computed(() =>
  props.currentSortOrder === 'asc' ? 'primary' : 'secondary'
)
</script>

<template>
  <Card
    variant="default"
    class="mx-4 mb-4 backdrop-blur-lg bg-opacity-95"
  >
    <div class="flex items-center gap-4 flex-wrap">
      <!-- Sort Order Toggle Button -->
      <div class="flex-shrink-0">
        <Button
          :variant="sortButtonVariant"
          size="md"
          :title="currentSortOrder === 'asc' ? 'Ascending (A-Z)' : 'Descending (Z-A)'"
          class="w-12 h-12 p-0 flex items-center justify-center"
          @click="toggleSortOrder"
        >
          <ArrowUpIcon v-if="currentSortOrder === 'asc'" class="w-5 h-5" />
          <ArrowDownIcon v-else class="w-5 h-5" />
        </Button>
      </div>

      <!-- Genre/Folder Dropdown -->
      <div class="min-w-[200px] flex-shrink-0">
        <Select
          :model-value="currentFolder"
          :options="folderOptions"
          label="Genre"
          @update:model-value="handleFolderChange"
        >
          <template #iconLeft>
            <FolderIcon class="w-5 h-5 text-gray-400" />
          </template>
        </Select>
      </div>

      <!-- Sort Field Dropdown -->
      <div class="min-w-[180px] flex-shrink-0">
        <Select
          :model-value="currentSort"
          :options="sortOptions"
          label="Sort by"
          @update:model-value="handleSortChange"
        >
          <template #iconLeft>
            <BarsArrowUpIcon class="w-5 h-5 text-gray-400" />
          </template>
        </Select>
      </div>

      <!-- Search Bar -->
      <div class="min-w-[350px] flex-grow">
        <Input
          v-model="searchQuery"
          type="search"
          label="Search"
          placeholder="Search artists, albums, genres, styles..."
          @focus="isSearchFocused = true"
          @blur="isSearchFocused = false"
        >
          <template #iconLeft>
            <MagnifyingGlassIcon
              class="w-5 h-5 transition-colors"
              :class="isSearchFocused ? 'text-primary-500' : 'text-gray-400'"
            />
          </template>
        </Input>
      </div>
    </div>
  </Card>
</template>
