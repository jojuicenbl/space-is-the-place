<script setup lang="ts">
/**
 * Badge component - Tailwind CSS version
 * Replaces: components/UI/TagPill.vue
 *
 * Features:
 * - Multiple variants (default, primary, secondary, success, warning, error)
 * - Removable badges (with close icon)
 * - Dot indicator option
 * - Size variants (sm, md, lg)
 */

interface Props {
  text?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  dot?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  text: undefined,
  variant: 'default',
  size: 'md',
  removable: false,
  dot: false,
})

const emit = defineEmits<{
  remove: []
}>()

const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200'

const variantClasses = {
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700',
  primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
  secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200',
  success: 'bg-green-100 text-green-800 hover:bg-green-200',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  error: 'bg-red-100 text-red-800 hover:bg-red-200'
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
}

const dotClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5'
}

const dotColorClasses = {
  default: 'bg-gray-500',
  primary: 'bg-primary-600',
  secondary: 'bg-secondary-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600'
}
</script>

<template>
  <span
    :class="[
      baseClasses,
      variantClasses[variant],
      sizeClasses[size]
    ]"
  >
    <!-- Dot indicator -->
    <span
      v-if="dot"
      :class="[
        'rounded-full',
        dotClasses[size],
        dotColorClasses[variant]
      ]"
    />

    <!-- Text content or slot -->
    <slot>{{ text }}</slot>

    <!-- Remove button -->
    <button
      v-if="removable"
      type="button"
      class="ml-0.5 hover:opacity-70 focus:outline-none"
      :class="size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'"
      @click="emit('remove')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
