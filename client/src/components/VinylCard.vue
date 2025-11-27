<script setup lang="ts">
/**
 * VinylCard component - Tailwind CSS version
 * Migré de: components/VinylCard.vue (Vuetify)
 *
 * Migration notes:
 * - Remplace <style scoped> par classes Tailwind utility
 * - Utilise Card.vue comme base avec padding="none"
 * - Améliore hover effect avec scale et shadow
 * - Ajoute support dark mode
 * - Préserve toutes les fonctionnalités (navigation, image handling)
 *
 * Features:
 * - Click navigation vers release detail
 * - Hover effect avec lift et opacity
 * - Lazy-loading images avec error handling
 * - Aspect ratio 1:1 (album cover)
 * - Responsive design
 */

import { useRouter } from 'vue-router'
import type { CollectionRelease } from '@/types/models/Release'
import ImageUtils from '@/utils/imageHelpers'
import Card from '@/components/UI/Card.vue'
import { computed } from 'vue'

interface Props {
  release: CollectionRelease
  variant?: 'default' | 'bordered' | 'elevated' | 'flat'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const router = useRouter()

const navigateToRelease = () => {
  router.push(`/release/${props.release.id}`)
}

const coverImage = computed(() =>
  ImageUtils.getSmallImageUrl(props.release.basic_information.cover_image)
)

const artistName = computed(() =>
  props.release.basic_information.artists[0]?.name ?? 'Unknown Artist'
)
</script>

<template>
  <Card
    :variant="variant"
    padding="none"
    clickable
    class="overflow-hidden group relative"
    @click="navigateToRelease"
  >
    <img
      :src="coverImage"
      :alt="release.basic_information.title"
      :title="`${artistName} - ${release.basic_information.title}`"
      class="w-full aspect-square object-cover block transition-all duration-300 group-hover:scale-105"
      loading="lazy"
      @error="ImageUtils.handleImageError"
    />

    <!-- Hover overlay with release info (desktop only) -->
    <div
      class="vinyl-overlay hidden md:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent
             p-3 pt-8 translate-y-full opacity-0 transition-all duration-300 ease-out
             group-hover:translate-y-0 group-hover:opacity-100"
    >
      <p class="text-white/70 text-xs font-medium truncate mb-0.5">
        {{ artistName }}
      </p>
      <p class="text-white text-sm font-semibold truncate">
        {{ release.basic_information.title }}
      </p>
    </div>
  </Card>
</template>
