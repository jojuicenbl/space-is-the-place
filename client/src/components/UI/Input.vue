<script setup lang="ts">
/**
 * Input component - Tailwind CSS version
 * NEW component (no Vuetify equivalent)
 *
 * Features:
 * - Multiple types (text, email, password, number, search, url, tel)
 * - Label + helper text
 * - Error states with messages
 * - Icon support (left/right)
 * - Disabled + readonly states
 * - Full accessibility (ARIA)
 */

import { computed, useAttrs } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url' | 'tel'
  label?: string
  placeholder?: string
  helperText?: string
  error?: string | boolean
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  fullWidth: true,
  disabled: false,
  readonly: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const attrs = useAttrs()

const inputId = computed<string>(() => {
  return (attrs.id as string) || `input-${Math.random().toString(36).substr(2, 9)}`
})

const baseInputClasses = 'block px-4 py-2.5 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'

const borderClasses = computed(() => {
  if (props.error) {
    return 'border-red-500 focus:border-red-500 focus:ring-red-500'
  }
  return 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500'
})

const widthClass = props.fullWidth ? 'w-full' : ''

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div :class="[widthClass]">
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Input wrapper for icons -->
    <div class="relative">
      <!-- Icon left slot -->
      <div
        v-if="$slots.iconLeft"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <slot name="iconLeft" />
      </div>

      <!-- Input field -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined"
        :class="[
          baseInputClasses,
          borderClasses,
          widthClass,
          $slots.iconLeft ? 'pl-10' : '',
          $slots.iconRight ? 'pr-10' : ''
        ]"
        @input="handleInput"
        v-bind="$attrs"
      />

      <!-- Icon right slot -->
      <div
        v-if="$slots.iconRight"
        class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      >
        <slot name="iconRight" />
      </div>
    </div>

    <!-- Helper text -->
    <p
      v-if="helperText && !error"
      :id="`${inputId}-helper`"
      class="mt-1.5 text-sm text-gray-500 dark:text-gray-400"
    >
      {{ helperText }}
    </p>

    <!-- Error message -->
    <p
      v-if="error"
      :id="`${inputId}-error`"
      class="mt-1.5 text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {{ typeof error === 'string' ? error : 'This field has an error' }}
    </p>
  </div>
</template>
