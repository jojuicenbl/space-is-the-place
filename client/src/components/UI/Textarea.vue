<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    error?: string
    helperText?: string
    disabled?: boolean
    required?: boolean
    rows?: number
    id?: string
  }>(),
  {
    label: undefined,
    placeholder: undefined,
    error: undefined,
    helperText: undefined,
    disabled: false,
    required: false,
    rows: 4,
    id: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`)
const isFocused = ref(false)

const textareaClass = computed(() => {
  const baseClass =
    'w-full px-3 py-2 border rounded-md transition-colors duration-200 font-sans text-base resize-y min-h-[100px]'
  const stateClass = props.error
    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30'
    : props.disabled
      ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
      : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/30'
  const backgroundClass = props.disabled ? '' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

  return `${baseClass} ${stateClass} ${backgroundClass}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label" :for="textareaId" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Textarea -->
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="textareaClass"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined"
      @input="handleInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <!-- Helper text -->
    <p v-if="helperText && !error" :id="`${textareaId}-helper`" class="mt-1 text-xs text-gray-600">
      {{ helperText }}
    </p>

    <!-- Error message -->
    <p v-if="error" :id="`${textareaId}-error`" class="mt-1 text-xs text-red-600" role="alert">
      {{ error }}
    </p>
  </div>
</template>
