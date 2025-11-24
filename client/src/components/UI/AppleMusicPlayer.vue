<template>
  <!-- <div v-if="isVisible" class="apple-music-player">
    <div class="player-header">
      <div class="apple-music-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <span class="player-title">Écouter sur Apple Music</span>
    </div> -->
  <!-- <div class="iframe-container">
      <iframe
        :src="embedUrl"
        :style="{ width: '100%', height: playerHeight + 'px' }"
        frameborder="0"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        loading="lazy"
        @load="onPlayerLoad"
      ></iframe>
    </div> -->
  <!-- <div v-if="appleMusicData" class="player-info">
      <small class="text-muted">
        {{ appleMusicData.artistName }} • {{ appleMusicData.trackCount }} titre{{ appleMusicData.trackCount > 1 ? 's' : '' }}
      </small>
    </div>
  </div> -->
  <div v-if="appleMusicData" class="iframe-container">
    <iframe
      :src="embedUrl"
      :style="{ width: '100%', height: playerHeight + 'px' }"
      frameborder="0"
      allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
      loading="lazy"
    ></iframe>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppleMusicService, { type AppleMusicMatch } from '@/services/appleMusicApi'

interface Props {
  artistName: string
  albumTitle: string
  year?: number
  height?: number
  country?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 450,
  country: 'us',
  year: undefined
})

const emit = defineEmits<{
  matchFound: [hasMatch: boolean]
}>()

const appleMusicData = ref<AppleMusicMatch | null>(null)
const isLoading = ref(true)
const isVisible = ref(false)

const playerHeight = computed(() => props.height)

const embedUrl = computed(() => {
  if (!appleMusicData.value) return ''
  return AppleMusicService.getAppleMusicEmbedUrl(
    appleMusicData.value.collectionId,
    props.country,
    appleMusicData.value.collectionName
  )
})

onMounted(async () => {
  try {
    isLoading.value = true

    const result = await AppleMusicService.searchAlbum(
      props.artistName,
      props.albumTitle,
      props.year
    )

    if (result) {
      appleMusicData.value = result
      isVisible.value = true
      emit('matchFound', true)
    } else {
      emit('matchFound', false)
    }
  } catch (error) {
    console.error('Error loading Apple Music player:', error)
  } finally {
    isLoading.value = false
  }
})
</script>
<style scoped>
.apple-music-player {
  background: linear-gradient(135deg, #fa2d48 0%, #ff6b35 100%);
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
  box-shadow: 0 4px 20px rgba(250, 45, 72, 0.2);
}

.player-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: white;
}

.apple-music-logo {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.iframe-container {
  border-radius: 8px;
  overflow: hidden;
  /* background: #000; */
  /* box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); */
}

.player-info {
  margin-top: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.text-muted {
  font-size: 0.8rem;
}

/* Mode sombre adaptatif */
@media (prefers-color-scheme: dark) {
  .apple-music-player {
    background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .apple-music-player {
    margin: 16px 0;
    padding: 12px;
  }

  .player-header {
    margin-bottom: 8px;
  }
}
</style>
