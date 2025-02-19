<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { CollectionRelease } from '@/types/models/Release'
import ImageUtils from '@/utils/imageHelpers';
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
    ImageUtils.getSmallImageUrl(props.release.basic_information.cover_image)
)

</script>
<template>
    <div class="vinyl-card" @click="navigateToRelease">
        <img :src="coverImage" :alt="release.basic_information.title" class="cover-image" @error="ImageUtils.handleImageError" />
    </div>
</template>
<style scoped>
.vinyl-card {
    cursor: pointer;
    transition: opacity 0.1s ease-in-out;
    /* border-radius: 4px; */
    overflow: hidden;
    background: white;
    opacity: 1;
    display: flex;
    line-height: 0;
}

.vinyl-card:hover {
    opacity: 0.8;
}

.cover-image {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: inherit;
    display: block;
}
</style>