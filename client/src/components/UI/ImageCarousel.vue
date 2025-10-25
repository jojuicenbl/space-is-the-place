<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Image } from '@/types/models/Release'
import ImageUtils from '@/utils/imageHelpers'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

const props = defineProps<{
  images: Image[]
}>()

const currentIndex = ref(0)
const isImageLoading = ref(false)

const currentImage = computed(() => {
  return props.images[currentIndex.value]
})

const currentImageUrl = computed(() => {
  if (!currentImage.value) return ''
  return ImageUtils.getSmallImageUrl(currentImage.value.uri)
})

const loadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

// Optimized: Change index immediately for instant navigation
const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const previousImage = () => {
  currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
}

const goToImage = (index: number) => {
  if (index === currentIndex.value) return
  currentIndex.value = index
}

const handleImageLoad = () => {
  isImageLoading.value = false
}

const handleImageError = (event: Event) => {
  ImageUtils.handleImageError(event)
  isImageLoading.value = false
}

onMounted(() => {
  // Force initial render of image
  isImageLoading.value = false
})
</script>
<template>
  <div class="carousel-container">
    <div class="carousel-wrapper">
      <div class="image-container">
        <div class="image-wrapper">
          <Transition name="fade" mode="out-in">
            <SkeletonLoader
              v-if="isImageLoading"
              type="image"
              class="carousel-image"

            />
            <img
              v-else
              :key="currentIndex"
              :src="currentImageUrl"
              :alt="`Image ${currentIndex + 1}`"
              class="carousel-image"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </Transition>
        </div>
        <!-- Navigation buttons -->
        <button class="carousel-button prev" aria-label="Previous image" @click="previousImage">
          <ChevronLeftIcon class="w-6 h-6" />
        </button>
        <button class="carousel-button next" aria-label="Next image" @click="nextImage">
          <ChevronRightIcon class="w-6 h-6" />
        </button>
      </div>
      <!-- Dots indicator -->
      <div class="carousel-dots">
        <button
          v-for="(_, index) in images"
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          :aria-label="`Go to image ${index + 1}`"
          @click="goToImage(index)"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.carousel-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
}

.image-container {
  position: relative;
  width: 100%;
  margin-bottom: 16px;
  aspect-ratio: 1/1;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}


.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
}

.carousel-button:hover {
  background: rgba(255, 255, 255, 0.95);
}

.carousel-button.prev {
  left: 10px;
}

.carousel-button.next {
  right: 10px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.dot:hover {
  background: #bdbdbd;
}

.dot.active {
  background: #666;
  transform: scale(1.2);
}

/* Transition animations - Optimized for instant feel */
.fade-enter-active {
  transition: opacity 0.15s ease-in;
}

.fade-leave-active {
  transition: opacity 0.1s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
