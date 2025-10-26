<script setup lang="ts">
/**
 * Card component - Tailwind CSS version
 * Base component for VinylCard and other card layouts
 *
 * Features:
 * - Multiple variants (default, bordered, elevated, flat)
 * - Padding variants (none, sm, md, lg)
 * - Hover states with lift effect
 * - Clickable cards (as link or button)
 * - Header, body, footer slots
 * - Image slot with aspect ratio control
 */

interface Props {
  variant?: 'default' | 'bordered' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
  href?: string
  to?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  clickable: false,
})

const baseClasses = 'rounded-md transition-all duration-200'

const variantClasses = {
  default: 'bg-white dark:bg-gray-800 shadow-md',
  bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  flat: 'bg-gray-50 dark:bg-gray-900',
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const hoverClasses = props.hoverable
  ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
  : ''

const clickableClasses = props.clickable ? 'cursor-pointer active:scale-[0.98]' : ''

const isLink = !!props.href || !!props.to
</script>

<template>
  <component
    :is="isLink ? (href ? 'a' : 'router-link') : 'div'"
    :href="href"
    :to="to"
    :class="[
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      hoverClasses,
      clickableClasses,
    ]"
  >
    <!-- Image slot (optional) -->
    <div v-if="$slots.image" class="overflow-hidden rounded-t-xl -m-6 mb-6">
      <slot name="image" />
    </div>

    <!-- Header slot (optional) -->
    <div v-if="$slots.header" class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      <slot name="header" />
    </div>

    <!-- Default slot (body content) -->
    <div>
      <slot />
    </div>

    <!-- Footer slot (optional) -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <slot name="footer" />
    </div>
  </component>
</template>
