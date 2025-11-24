<script setup lang="ts">
import { computed, useAttrs } from 'vue'

const props = withDefaults(
  defineProps<{
    type?: 'image' | 'text' | 'button' | 'card'
    width?: string
    height?: string
  }>(),
  {
    type: 'image',
    width: undefined,
    height: undefined
  }
)

const attrs = useAttrs()

const skeletonClass = computed(() => {
  const baseClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]'
  const shapeClass = props.type === 'button' || props.type === 'text' ? 'rounded' : 'rounded-md'

  // Si des classes externes sont appliquées via class="...", on ne force pas les dimensions par défaut
  const hasExternalClass = attrs.class && attrs.class !== ''
  
  let sizeClass = ''
  if (!hasExternalClass) {
    switch (props.type) {
      case 'image':
        sizeClass = props.width || props.height ? '' : 'w-full h-48'
        break
      case 'text':
        sizeClass = 'h-4 w-3/4'
        break
      case 'button':
        sizeClass = 'h-10 w-24'
        break
      case 'card':
        sizeClass = 'h-64 w-full'
        break
    }
  }

  return `${baseClass} ${shapeClass} ${sizeClass}`
})

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  return style
})
</script>

<template>
  <div :class="skeletonClass" :style="skeletonStyle" aria-busy="true" aria-live="polite">
    <span class="sr-only">Loading...</span>
  </div>
</template>

<style scoped>
/* Custom animation for smoother pulse */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-pulse {
  animation: shimmer 2s ease-in-out infinite;
}
</style>
