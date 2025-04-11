<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Image } from '@/types/models/Release'
import ImageUtils from '@/utils/imageHelpers'
import { VSkeletonLoader } from 'vuetify/components'

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

const nextImage = async () => {
    const nextIndex = (currentIndex.value + 1) % props.images.length
    const nextUrl = ImageUtils.getSmallImageUrl(props.images[nextIndex].uri)

    isImageLoading.value = true
    try {
        await loadImage(nextUrl)
        currentIndex.value = nextIndex
    } catch (error) {
        console.error('Failed to load next image:', error)
    }
    isImageLoading.value = false
}

const previousImage = async () => {
    const prevIndex = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
    const prevUrl = ImageUtils.getSmallImageUrl(props.images[prevIndex].uri)

    isImageLoading.value = true
    try {
        await loadImage(prevUrl)
        currentIndex.value = prevIndex
    } catch (error) {
        console.error('Failed to load previous image:', error)
    }
    isImageLoading.value = false
}

const goToImage = async (index: number) => {
    if (index === currentIndex.value) return

    const targetUrl = ImageUtils.getSmallImageUrl(props.images[index].uri)
    isImageLoading.value = true
    try {
        await loadImage(targetUrl)
        currentIndex.value = index
    } catch (error) {
        console.error('Failed to load image:', error)
    }
    isImageLoading.value = false
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
                    <Transition mode="out-in">
                        <v-skeleton-loader v-if="isImageLoading" type="image" class="carousel-image" :loading="true" />
                        <img v-else :key="currentIndex" :src="currentImageUrl" :alt="`Image ${currentIndex + 1}`"
                            class="carousel-image" @error="handleImageError" @load="handleImageLoad" />
                    </Transition>
                </div>
                <!-- Navigation buttons -->
                <button class="carousel-button prev" aria-label="Previous image" @click="previousImage">
                    <span class="material-icons">chevron_left</span>
                </button>
                <button class="carousel-button next" aria-label="Next image" @click="nextImage">
                    <span class="material-icons">chevron_right</span>
                </button>
            </div>
            <!-- Dots indicator -->
            <div class="carousel-dots">
                <button v-for="(_, index) in images" :key="index" class="dot"
                    :class="{ active: index === currentIndex }" :aria-label="`Go to image ${index + 1}`"
                    @click="goToImage(index)" />
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
}

.image-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.carousel-image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

:deep(.v-skeleton-loader__image) {
    height: 500px !important;
    border-radius: 8px;
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

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-in {
    opacity: 0;
    transition: opacity 0.5s ease-in-out;
}

.fade-in-loaded {
    opacity: 1;
}
</style>