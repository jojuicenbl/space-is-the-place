<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { CollectionRelease } from '@/types/models/Release'
import { getSmallImageUrl } from '@/utils/imageHelpers';
import { computed } from 'vue';

interface Props {
    release: CollectionRelease
}

const props = defineProps<Props>()
const router = useRouter()

const navigateToRelease = () => {
    router.push(`/release/${props.release.id}`)
}

const coverImage = computed(() =>
    getSmallImageUrl(props.release.basic_information.cover_image)
)

const handleImageError = (event: Event) => {
    const target = event.target as HTMLImageElement
    if (target) {
        target.src = '/default-cover.webp'
    }
}
</script>
<template>
    <div class="vinyl-card" @click="navigateToRelease">
        <img :src="coverImage" :alt="release.basic_information.title" class="cover-image" @error="handleImageError" />
        <div class="info">
            <h3 class="title">{{ release.basic_information.title }}</h3>
            <p class="artist">{{ release.basic_information.artists[0]?.name }}</p>
        </div>
    </div>
</template>
<style scoped>
.vinyl-card {
    cursor: pointer;
    transition: transform 0.2s;
    border-radius: 0.5rem;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.vinyl-card:hover {
    transform: translateY(-4px);
}

.cover-image {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

.info {
    padding: 1rem;
}

.title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.artist {
    font-size: 0.875rem;
    color: #666;
    margin: 0.25rem 0 0;
}
</style>