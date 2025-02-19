<script setup lang="ts">
import type { DiscogsFolder } from '@/services/discogsApi'
import type { SortField, SortOrder } from '@/services/discogsApi'
import { ref } from 'vue'
import { VIcon } from 'vuetify/components'

defineProps<{
  folders: DiscogsFolder[]
  currentFolder: number
  currentSort: SortField
  currentSortOrder: SortOrder
}>()

const emit = defineEmits<{
  (e: 'update:folder', folderId: number): void
  (e: 'update:sort', sort: SortField): void
  (e: 'update:sortOrder', order: SortOrder): void
}>()

const sortOptions = [
  { value: 'added', label: 'Date Added' },
  { value: 'artist', label: 'Artist Name' },
  { value: 'title', label: 'Album Title' },
] as const

const openSelect = ref<'folder' | 'sort' | 'order' | null>(null)
</script>

<template>
  <div class="d-flex ga-4 mb-8 flex-wrap">
    <div class="d-flex flex-column">
      <div class="d-flex align-center">
        <label for="folder" class="font-weight-medium">Genre/Folder:</label>
        <v-icon :icon="openSelect === 'folder' ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small" />
      </div>
      <select 
        id="folder" 
        :value="currentFolder"
        class="pa-2 rounded min-width-200 border border-dark"
        @change="emit('update:folder', Number(($event.target as HTMLSelectElement).value))"
        @focus="openSelect = 'folder'"
        @blur="openSelect = null"
      >
        <option 
          v-for="folder in folders" 
          :key="folder.id" 
          :value="folder.id"
        >
          {{ folder.name }} ({{ folder.count }})
        </option>
      </select>
    </div>

    <div class="d-flex flex-column">
      <div class="d-flex align-center">
        <label for="sort" class="font-weight-medium">Sort by:</label>
        <v-icon :icon="openSelect === 'sort' ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small" />
      </div>
      <select 
        id="sort" 
        :value="currentSort"
        class="pa-2 rounded min-width-200 border border-dark"
        @change="emit('update:sort', ($event.target as HTMLSelectElement).value as SortField)"
        @focus="openSelect = 'sort'"
        @blur="openSelect = null"
      >
        <option 
          v-for="option in sortOptions" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <div class="d-flex flex-column">
      <div class="d-flex align-center">
        <label for="order" class="font-weight-medium">Order:</label>
        <v-icon :icon="openSelect === 'order' ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="small" />
      </div>
      <select 
        id="order" 
        :value="currentSortOrder"
        class="pa-2 rounded min-width-200 border border-dark"
        @change="emit('update:sortOrder', ($event.target as HTMLSelectElement).value as SortOrder)"
        @focus="openSelect = 'order'"
        @blur="openSelect = null"
      >
        <option value="asc">Ascending (A-Z)</option>
        <option value="desc">Descending (Z-A)</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.min-width-200 {
  min-width: 200px;
}

@media (max-width: 768px) {
  select {
    width: 100%;
  }
}
</style> 