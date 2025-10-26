<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getOneRelease } from '@/services/discogsApi'
import ImageUtils from '@/utils/imageHelpers'
import { useResponsive } from '@/utils/responsive'
import Badge from '@/components/ui/Badge.vue'
import ImageCarousel from '@/components/ui/ImageCarousel.vue'
import AppleMusicPlayer from '@/components/ui/AppleMusicPlayer.vue'
import type { BasicInformation } from '@/types/models/Release'

const route = useRoute()
const release = ref<BasicInformation>()
const isLoading = ref(true)
const error = ref<string | null>(null)
const hasAppleMusicMatch = ref(false)

const { isMobileView } = useResponsive()

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
  release.value
    ? ImageUtils.getSmallImageUrl(release.value.images?.[0]?.uri)
    : '/default-cover.webp'
)

// Apple Music player data
const artistName = computed(() => release.value?.artists?.[0]?.name || '')
const albumTitle = computed(() => release.value?.title || '')
const releaseYear = computed(() => release.value?.year)
const styles = computed(() => release.value?.styles || [])
</script>
<template>
  <div>
    <div class="content-wrapper">
      <div v-if="isLoading" class="flex justify-center items-center min-height-300">
        <div class="vinyl-loader"></div>
      </div>
      <div v-else-if="error" class="flex justify-center items-center min-height-300">
        {{ error }}
      </div>
      <div v-else-if="release" class="release-content">
        <div class="release-main">
          <div class="info-section">
            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-bold mb-6 text-left">
              <a
                v-if="release.uri"
                :href="release.uri"
                target="_blank"
                rel="noopener noreferrer"
                class="text-inherit no-underline hover:underline transition-all duration-300"
              >
                {{ release.title }}
              </a>
              <span v-else>{{ release.title }}</span>
            </h1>
            <div class="release-details">
              <p><strong>Artist:</strong> {{ release.artists?.[0]?.name }}</p>
              <p><strong>Year:</strong> {{ release.year }}</p>
              <p><strong>Label:</strong> {{ release.labels?.[0]?.name }}</p>
            </div>
            <!-- Container pour genres et styles -->
            <div class="genres-styles-container">
              <div class="genres-section">
                <h3 class="section-title">Genres</h3>
                <div class="tags-container">
                  <Badge v-for="genre in release.genres" :key="genre" variant="primary" size="md">
                    {{ genre }}
                  </Badge>
                </div>
              </div>
              <div v-if="styles.length > 0" class="styles-section">
                <h3 class="section-title">Styles</h3>
                <div class="tags-container">
                  <Badge v-for="style in release.styles" :key="style" variant="secondary" size="md">
                    {{ style }}
                  </Badge>
                </div>
              </div>
            </div>
            <div v-if="isMobileView" class="carousel-section mobile-carousel">
              <ImageCarousel v-if="release.images && release.images.length > 0" :images="release.images" />
              <img v-else :src="coverImage" :alt="release.title" class="cover-image"
                @error="ImageUtils.handleImageError" />
            </div>
            <div v-if="release.tracklist && release.tracklist.length > 0" class="tracklist-section">
              <h3 class="section-title">Tracklist</h3>
              <div class="tracklist-container">
                <div v-for="track in release.tracklist" :key="`${track.position}-${track.title}`" class="track-item">
                  <div class="track-position">{{ track.position }}</div>
                  <div class="track-title">{{ track.title }}</div>
                  <div v-if="track.duration" class="track-duration">{{ track.duration }}</div>
                </div>
              </div>
            </div>
            <div v-if="hasAppleMusicMatch" class="player-container">
              <h3 class="section-title">Listen now</h3>
            </div>
            <AppleMusicPlayer v-if="artistName && albumTitle" :artist-name="artistName" :album-title="albumTitle"
              :year="releaseYear" :height="450" @match-found="hasMatch => (hasAppleMusicMatch = hasMatch)" />
          </div>
          <div v-if="!isMobileView" class="carousel-section desktop-carousel">
            <ImageCarousel v-if="release.images && release.images.length > 0" :images="release.images" />
            <img v-else :src="coverImage" :alt="release.title" class="cover-image"
              @error="ImageUtils.handleImageError" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.min-height-300 {
  min-height: 300px;
}

.content-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

.release-content {
  width: 100%;
}

.back-button-container {
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #9e9e9e;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
}

.back-button:hover {
  background-color: rgba(158, 158, 158, 0.1);
  color: #757575;
}

.back-button:active {
  transform: scale(0.95);
}

/* Layout mobile-first */
.release-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.carousel-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.mobile-carousel {
  margin: 24px 0;
}

.cover-image {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 8px;
}

.info-section {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.release-details {
  margin: 16px 0 24px 0;
}

.release-details p {
  margin: 8px 0;
  line-height: 1.5;
}

.player-container {
  margin: 12px 0;
}

.genres-section,
.styles-section {
  margin: 12px 0;
}

.section-title {
  margin-bottom: 12px;
  font-size: 1.1rem;
  font-weight: 600;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  max-width: 100%;
}

.tracklist-section {
  margin: 24px 0 0 0;
}

.tracklist-container {
  background-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background-color 0.2s ease;
  color: var(--color-text);
}

.track-item:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

:root.dark .track-item:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.05);
}

.track-position {
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.6;
  min-width: 40px;
  font-size: 0.9rem;
}

.track-title {
  flex: 1;
  margin-left: 16px;
  line-height: 1.4;
  color: var(--color-text);
}

.track-duration {
  color: var(--color-text);
  opacity: 0.6;
  font-size: 0.9rem;
  min-width: 60px;
  text-align: right;
}

.vinyl-loader {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #333 30%, #111 31%, #111 100%);
  position: relative;
  animation: spin 1.5s linear infinite;
}

.vinyl-loader::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Tablettes et small desktop */
@media (min-width: 768px) {
  .content-wrapper {
    padding: 0 24px;
  }

  .back-button-container {
    margin-bottom: 32px;
  }

  .back-button {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }

  .release-main {
    flex-direction: row;
    gap: 32px;
    align-items: flex-start;
  }

  .desktop-carousel {
    flex: 0 0 320px;
    justify-content: flex-start;
  }

  .mobile-carousel {
    /* En desktop, s'assurer que mobile-carousel est caché via v-if */
    display: none;
  }

  .cover-image {
    max-width: 320px;
  }

  .info-section {
    flex: 1;
    min-width: 0;
  }

  .release-details {
    margin: 24px 0 0px 0;
  }

  .genres-styles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .genres-section,
  .styles-section {
    flex: 1 1 260px;
  }

  .tracklist-section {
    margin: 32px 0 0 0;
  }

  .track-item {
    padding: 16px 20px;
  }

  .track-position {
    min-width: 50px;
  }

  .track-title {
    margin-left: 20px;
  }

  .track-duration {
    min-width: 80px;
  }
}

/* Medium desktop - tailles plus confortables */
@media (min-width: 900px) {
  .release-main {
    gap: 48px;
  }

  .desktop-carousel {
    flex: 0 0 400px;
  }

  .cover-image {
    max-width: 400px;
  }

  .genres-styles-container {
    flex-direction: row;
    gap: 32px;
    max-width: 100%;
  }
}

/* Large desktop */
@media (min-width: 1200px) {
  .desktop-carousel {
    flex: 0 0 500px;
  }

  .cover-image {
    max-width: 500px;
  }
}

.info-section,
.genres-styles-container,
.genres-section,
.styles-section {
  min-width: 0;
}
</style>
