<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}>()

const pages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= props.totalPages; i++) {
    if (
      i === 1 ||
      i === props.totalPages ||
      (i >= props.currentPage - delta && i <= props.currentPage + delta)
    ) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})
</script>

<template>
  <div class="pager">
    <button 
      :disabled="currentPage === 1"
      class="pager-button"
      @click="onPageChange(currentPage - 1)"
    >
      Previous
    </button>
    
    <button 
      v-for="page in pages" 
      :key="page"
      :class="[
        'pager-button',
        page === currentPage ? 'active' : '',
        page === '...' ? 'dots' : ''
      ]"
      :disabled="page === '...'"
      @click="page !== '...' && onPageChange(Number(page))"
    >
      {{ page }}
    </button>

    <button 
      :disabled="currentPage === totalPages"
      class="pager-button"
      @click="onPageChange(currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 2rem 0;
}

.pager-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.pager-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager-button.active {
  background: #000;
  color: white;
  border-color: #000;
}

.pager-button.dots {
  border: none;
  padding: 0.5rem;
}
</style> 