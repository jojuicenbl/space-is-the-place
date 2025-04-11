<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOneRelease } from '@/services/discogsApi'
import ImageUtils from '@/utils/imageHelpers'
import BaseButton from "@/components/UI/BaseButton.vue"
import MainTitle from "@/components/UI/MainTitle.vue"
import TagPill from "@/components/UI/TagPill.vue"
import ImageCarousel from "@/components/UI/ImageCarousel.vue"
import type { BasicInformation } from '@/types/models/Release'
import { VContainer } from 'vuetify/components'
const route = useRoute()
const router = useRouter()
const release = ref<BasicInformation>()
const isLoading = ref(true)
const error = ref<string | null>(null)

const goBack = () => {
    router.back()
}

onMounted(async () => {
    const releaseId = Number(route.params.id)

    try {
        isLoading.value = true
        const data = await getOneRelease(releaseId)
        release.value = data
    } catch (err) {
        error.value = 'Failed to load release details'
        console.error('Error loading release:', err)
    } finally {
        isLoading.value = false
    }
})

const coverImage = computed(() =>
    release.value ? ImageUtils.getSmallImageUrl(release.value.images?.[0]?.uri) : '/default-cover.webp'
)
</script>
<template>
    <div class="mx-auto" style="max-width: 1400px">
        <BaseButton class="mb-8" @click="goBack">
            Go back
        </BaseButton>
        <div v-if="isLoading" class="d-flex justify-center align-center min-height-300">
            Loading...
        </div>
        <div v-else-if="error" class="d-flex justify-center align-center min-height-300">
            {{ error }}
        </div>
        <v-container v-else-if="release" class="d-flex flex-row ga-6">
            <div class="carousel-section">
                <ImageCarousel v-if="release.images && release.images.length > 0" :images="release.images"
                    @vue:mounted="() => { }" />
                <img v-else :src="coverImage" :alt="release.title" class="mb-4" style="max-width: 500px"
                    @error="ImageUtils.handleImageError" />
            </div>
            <div class="d-flex flex-column">
                <MainTitle :text="release.title" align="left" />
                <div class="mt-4">
                    <p><strong>Artist:</strong> {{ release.artists?.[0]?.name }}</p>
                    <p><strong>Year:</strong> {{ release.year }}</p>
                    <p><strong>Label:</strong> {{ release.labels?.[0]?.name }}</p>
                </div>
                <div class="mt-4">
                    <h3 class="mb-2">Genres</h3>
                    <div class="d-flex flex-wrap">
                        <TagPill v-for="genre in release.genres" :key="genre" :text="genre" />
                    </div>
                </div>
                <div class="mt-4">
                    <h3 class="mb-2">Styles</h3>
                    <div class="d-flex flex-wrap">
                        <TagPill v-for="style in release.styles" :key="style" :text="style" />
                    </div>
                </div>
            </div>
        </v-container>
    </div>
</template>
<style scoped>
.min-height-300 {
    min-height: 300px;
}

.carousel-section {
    flex: 0 0 500px;
}
</style>