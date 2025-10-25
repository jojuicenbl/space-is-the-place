<script setup lang="ts">
/**
 * Button component - Tailwind CSS version
 * Replaces: components/UI/BaseButton.vue
 *
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost)
 * - Multiple sizes (sm, md, lg)
 * - Loading state with spinner
 * - Disabled state
 * - Icon support (left/right)
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
})

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
  outline: 'border-2 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
  ghost: 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

const widthClass = props.fullWidth ? 'w-full' : ''
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      widthClass
    ]"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Icon left slot -->
    <span v-if="$slots.iconLeft" class="mr-2 flex items-center">
      <slot name="iconLeft" />
    </span>

    <!-- Default slot (text content) -->
    <slot />

    <!-- Icon right slot -->
    <span v-if="$slots.iconRight" class="ml-2 flex items-center">
      <slot name="iconRight" />
    </span>
  </button>
</template>
