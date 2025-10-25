<script setup lang="ts">
/**
 * Select component - Tailwind CSS version
 * NEW component (replaces v-select from Vuetify)
 *
 * Features:
 * - Native <select> with Tailwind styling
 * - Label support
 * - Icon slot (left side)
 * - Error states
 * - Disabled state
 * - Dark mode support
 */

import { computed } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue?: string | number
  options: SelectOption[]
  label?: string
  placeholder?: string
  error?: string | boolean
  disabled?: boolean
  required?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fullWidth: true,
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const baseSelectClasses = 'block px-4 py-2.5 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

const borderClasses = computed(() => {
  if (props.error) {
    return 'border-red-500 focus:border-red-500 focus:ring-red-500'
  }
  return 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
})

const widthClass = props.fullWidth ? 'w-full' : ''

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  // Convert to number if the original modelValue was a number
  const emitValue = typeof props.modelValue === 'number' ? Number(value) : value
  emit('update:modelValue', emitValue)
}

const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)
</script>

<template>
  <div :class="[widthClass]">
    <!-- Label -->
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Select wrapper for icon -->
    <div class="relative">
      <!-- Icon left slot -->
      <div
        v-if="$slots.iconLeft"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10"
      >
        <slot name="iconLeft" />
      </div>

      <!-- Select field -->
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="[
          baseSelectClasses,
          borderClasses,
          widthClass,
          'select-no-arrow',
          { 'pl-10': $slots.iconLeft }
        ]"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Chevron down icon (always visible) -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Error message -->
    <p
      v-if="error && typeof error === 'string'"
      :id="`${selectId}-error`"
      class="mt-1.5 text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/* Remove native select arrow on all browsers */
.select-no-arrow {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: none;
}

/* Remove IE/Edge default arrow */
.select-no-arrow::-ms-expand {
  display: none;
}
</style>
