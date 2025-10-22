<script setup lang="ts">
/**
 * Components Test Page
 * Visual testing for Tailwind UI components
 */

import { ref } from 'vue'
import { Button, Badge, Input } from '@/components/ui-tailwind'
import { MagnifyingGlassIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'

const searchValue = ref('')
const emailValue = ref('')
const passwordValue = ref('')
const errorInput = ref('')
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-6xl mx-auto space-y-12">
      <!-- Header -->
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Tailwind UI Components
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Phase 1: Atomic Components - Visual Testing
        </p>
      </div>

      <!-- Button Component -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Button Component</h2>

        <div class="space-y-6">
          <!-- Variants -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Variants</h3>
            <div class="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Sizes</h3>
            <div class="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <!-- States -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">States</h3>
            <div class="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </div>

          <!-- With Icons -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">With Icons</h3>
            <div class="flex flex-wrap gap-4">
              <Button variant="primary">
                <template #iconLeft>
                  <MagnifyingGlassIcon class="w-5 h-5" />
                </template>
                Search
              </Button>
              <Button variant="secondary">
                Send Email
                <template #iconRight>
                  <EnvelopeIcon class="w-5 h-5" />
                </template>
              </Button>
            </div>
          </div>

          <!-- Full Width -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Full Width</h3>
            <Button variant="primary" full-width>Full Width Button</Button>
          </div>
        </div>
      </section>

      <!-- Badge Component -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Badge Component</h2>

        <div class="space-y-6">
          <!-- Variants -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Variants</h3>
            <div class="flex flex-wrap gap-3">
              <Badge variant="default" text="Default" />
              <Badge variant="primary" text="Primary" />
              <Badge variant="secondary" text="Secondary" />
              <Badge variant="success" text="Success" />
              <Badge variant="warning" text="Warning" />
              <Badge variant="error" text="Error" />
            </div>
          </div>

          <!-- Sizes -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Sizes</h3>
            <div class="flex flex-wrap items-center gap-3">
              <Badge size="sm" text="Small" />
              <Badge size="md" text="Medium" />
              <Badge size="lg" text="Large" />
            </div>
          </div>

          <!-- With Dot -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">With Dot Indicator</h3>
            <div class="flex flex-wrap gap-3">
              <Badge variant="success" text="Online" dot />
              <Badge variant="warning" text="Away" dot />
              <Badge variant="error" text="Offline" dot />
            </div>
          </div>

          <!-- Removable -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Removable</h3>
            <div class="flex flex-wrap gap-3">
              <Badge variant="primary" text="Rock" removable />
              <Badge variant="secondary" text="Jazz" removable />
              <Badge variant="default" text="Electronic" removable />
            </div>
          </div>

          <!-- Use Case: Genre Tags -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Use Case: Album Genres</h3>
            <div class="flex flex-wrap gap-2">
              <Badge text="Progressive Rock" />
              <Badge text="Psychedelic" />
              <Badge text="Art Rock" />
              <Badge text="Experimental" />
              <Badge text="Space Rock" />
            </div>
          </div>
        </div>
      </section>

      <!-- Input Component -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Input Component</h2>

        <div class="space-y-6 max-w-2xl">
          <!-- Basic Input -->
          <Input
            v-model="searchValue"
            label="Search"
            placeholder="Search your collection..."
            helper-text="Try searching for an artist or album name"
          >
            <template #iconLeft>
              <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
            </template>
          </Input>

          <!-- Email Input -->
          <Input
            v-model="emailValue"
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            required
          >
            <template #iconLeft>
              <EnvelopeIcon class="w-5 h-5 text-gray-400" />
            </template>
          </Input>

          <!-- Password Input -->
          <Input
            v-model="passwordValue"
            type="password"
            label="Password"
            placeholder="Enter your password"
            helper-text="Must be at least 8 characters"
          />

          <!-- Error State -->
          <Input
            v-model="errorInput"
            label="Input with Error"
            placeholder="This has an error"
            error="This field is required"
          />

          <!-- Disabled State -->
          <Input
            label="Disabled Input"
            placeholder="You can't type here"
            disabled
            model-value="This is disabled"
          />
        </div>
      </section>

      <!-- Code Example -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Example</h2>
        <pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm"><code>&lt;script setup&gt;
import { Button, Badge, Input } from '@/components/ui-tailwind'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const search = ref('')
&lt;/script&gt;

&lt;template&gt;
  &lt;Button variant="primary"&gt;
    &lt;template #iconLeft&gt;
      &lt;MagnifyingGlassIcon class="w-5 h-5" /&gt;
    &lt;/template&gt;
    Search
  &lt;/Button&gt;

  &lt;Badge variant="success" text="New" dot /&gt;

  &lt;Input
    v-model="search"
    label="Search"
    placeholder="Type here..."
  /&gt;
&lt;/template&gt;</code></pre>
      </section>
    </div>
  </div>
</template>
