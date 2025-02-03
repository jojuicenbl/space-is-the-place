<script setup lang="ts">
import type { DiscogsFolder } from '@/services/discogsApi'
import type { SortField, SortOrder } from '@/services/discogsApi'

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

</script>

<template>
  <div class="filters-container">
    <div class="filter-group">
      <label for="folder">Genre/Folder:</label>
      <select 
        id="folder" 
        :value="currentFolder"
        @change="emit('update:folder', Number(($event.target as HTMLSelectElement).value))"
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

    <div class="filter-group">
      <label for="sort">Sort by:</label>
      <select 
        id="sort" 
        :value="currentSort"
        @change="emit('update:sort', ($event.target as HTMLSelectElement).value as SortField)"
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

    <div class="filter-group">
      <label for="order">Order:</label>
      <select 
        id="order" 
        :value="currentSortOrder"
        @change="emit('update:sortOrder', ($event.target as HTMLSelectElement).value as SortOrder)"
      >
        <option value="asc">Ascending (A-Z)</option>
        <option value="desc">Descending (Z-A)</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.filters-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 200px;
}

label {
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-group {
    width: 100%;
  }
  
  select {
    width: 100%;
  }
}
</style> 