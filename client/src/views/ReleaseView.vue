<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// import { useRoute, useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { getOneRelease } from '@/services/discogsApi'
import ImageUtils from '@/utils/imageHelpers'
import { useResponsive } from '@/utils/responsive'
import MainTitle from '@/components/UI/MainTitle.vue'
import TagPill from '@/components/UI/TagPill.vue'
import ImageCarousel from '@/components/UI/ImageCarousel.vue'
import AppleMusicPlayer from '@/components/UI/AppleMusicPlayer.vue'
import type { BasicInformation } from '@/types/models/Release'
// import { VIcon } from 'vuetify/components'

const route = useRoute()
// const router = useRouter()
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

// const goBack = () => {
//   router.go(-1)
// }
</script>
<template>
  <div>
    <div class="content-wrapper">
      <div v-if="isLoading" class="d-flex justify-center align-center min-height-300">
        Loading...
      </div>
      <div v-else-if="error" class="d-flex justify-center align-center min-height-300">
        {{ error }}
      </div>
      <div v-else-if="release" class="release-content">
        <!-- <div class="back-button-container">
            <button class="back-button" aria-label="Retour" @click="goBack">
              <v-icon size="20">mdi-chevron-left</v-icon>
            </button>
          </div> -->
        <!-- Main content -->
        <div class="release-main">
          <div class="info-section">
            <MainTitle :text="release.title" align="left" :href="release.uri" />
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
                  <TagPill v-for="genre in release.genres" :key="genre" :text="genre" />
                </div>
              </div>
              <div v-if="styles.length > 0" class="styles-section">
                <h3 class="section-title">Styles</h3>
                <div class="tags-container">
                  <TagPill v-for="style in release.styles" :key="style" :text="style" />
                </div>
              </div>
            </div>
            <!-- mobile style carousel -->
            <div v-if="isMobileView" class="carousel-section mobile-carousel">
              <ImageCarousel v-if="release.images && release.images.length > 0" :images="release.images" />
              <img v-else :src="coverImage" :alt="release.title" class="cover-image"
                @error="ImageUtils.handleImageError" />
            </div>
            <!-- Section Tracklist -->
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
            <!-- Lecteur Apple Music -->
            <div v-if="hasAppleMusicMatch" class="player-container">
              <h3 class="section-title">Listen now</h3>
            </div>
            <AppleMusicPlayer v-if="artistName && albumTitle" :artist-name="artistName" :album-title="albumTitle"
              :year="releaseYear" :height="450" @match-found="hasMatch => (hasAppleMusicMatch = hasMatch)" />
          </div>
          <!-- desktop style carousel -->
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
  width: 100%;
}

.release-details {
  margin: 16px 0 24px 0;
}

.release-details p {
  margin: 8px 0;
  line-height: 1.5;
}

.genres-styles-container {
  margin: 12px 0;
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
}

.tracklist-section {
  margin: 24px 0 0 0;
}

.tracklist-container {
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  overflow: hidden;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background-color 0.2s ease;
}

.track-item:nth-child(even) {
  background-color: #ececee;
  border-radius: 8px;
}

.track-position {
  font-weight: 600;
  color: #9e9e9e;
  min-width: 40px;
  font-size: 0.9rem;
}

.track-title {
  flex: 1;
  margin-left: 16px;
  line-height: 1.4;
}

.track-duration {
  color: #9e9e9e;
  font-size: 0.9rem;
  min-width: 60px;
  text-align: right;
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
    /* Évite que le texte déborde */
  }

  .release-details {
    margin: 24px 0 32px 0;
  }

  .genres-styles-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 32px 0;
  }

  .genres-section,
  .styles-section {
    flex: 0 0 auto;
    margin: 0;
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
</style>
