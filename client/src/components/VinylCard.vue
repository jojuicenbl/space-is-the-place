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
import Card from '@/components/ui-tailwind/Card.vue'
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
</script>

<template>
  <Card
    :variant="variant"
    padding="none"
    hoverable
    clickable
    @click="navigateToRelease"
    class="overflow-hidden group"
  >
    <img
      :src="coverImage"
      :alt="release.basic_information.title"
      :title="`${release.basic_information.artists[0]?.name} - ${release.basic_information.title}`"
      class="w-full aspect-square object-cover block transition-opacity duration-200 group-hover:opacity-80"
      @error="ImageUtils.handleImageError"
      loading="lazy"
    />
  </Card>
</template>
