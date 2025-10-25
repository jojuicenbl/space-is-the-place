<script setup lang="ts">
/**
 * Components Test Page
 * Visual testing for Tailwind UI components
 */

import { ref } from 'vue'
import { Button, Badge, Input } from '@/components/ui'
import Card from '@/components/ui/Card.vue'
import Navbar from '@/components/ui/Navbar.vue'
import Header from '@/components/ui/Header.vue'
import { MagnifyingGlassIcon, EnvelopeIcon, HomeIcon, MusicalNoteIcon, UserIcon } from '@heroicons/vue/24/outline'

const searchValue = ref('')
const emailValue = ref('')
const passwordValue = ref('')
const errorInput = ref('')
const headerSearchValue = ref('')
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
          Phase 1 & 2: Atomic + Layout Components - Visual Testing
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

      <!-- Card Component -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Card Component</h2>

        <div class="space-y-6">
          <!-- Variants -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Variants</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="default">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Default Card</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">With shadow-md</p>
              </Card>
              <Card variant="bordered">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Bordered Card</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">With 2px border</p>
              </Card>
              <Card variant="elevated">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Elevated Card</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">With shadow-lg</p>
              </Card>
              <Card variant="flat">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Flat Card</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">No shadow</p>
              </Card>
            </div>
          </div>

          <!-- Hoverable -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Hoverable (hover me!)</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="default" hoverable>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Hover Effect</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Lifts on hover with enhanced shadow</p>
              </Card>
              <Card variant="bordered" hoverable>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Bordered Hover</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Try hovering this card</p>
              </Card>
              <Card variant="flat" hoverable>
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Flat Hover</h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Smooth transition</p>
              </Card>
            </div>
          </div>

          <!-- With Slots -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">With Header and Footer</h3>
            <Card variant="default">
              <template #header>
                <h3 class="font-semibold text-gray-900 dark:text-white">Album Details</h3>
              </template>
              <p class="text-gray-600 dark:text-gray-400">This card has a header and footer using slots. Perfect for structured content like album information.</p>
              <template #footer>
                <div class="flex justify-between items-center">
                  <Badge variant="primary" text="Progressive Rock" />
                  <span class="text-sm text-gray-500">1973</span>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </section>

      <!-- Navbar Component -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Navbar Component</h2>

        <div class="space-y-6">
          <!-- Default Navbar -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Default Navbar</h3>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Navbar>
                <template #logo>
                  <span class="text-xl font-bold text-primary-600">Space Vinyl</span>
                </template>
                <template #nav>
                  <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors flex items-center gap-2">
                    <HomeIcon class="w-5 h-5" />
                    <span>Home</span>
                  </a>
                  <a href="#" class="text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors flex items-center gap-2">
                    <MusicalNoteIcon class="w-5 h-5" />
                    <span>Collection</span>
                  </a>
                </template>
                <template #actions>
                  <Button variant="outline" size="sm">
                    <template #iconLeft>
                      <UserIcon class="w-4 h-4" />
                    </template>
                    Profile
                  </Button>
                </template>
                <template #mobile-nav>
                  <a href="#" class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Home</a>
                  <a href="#" class="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">Collection</a>
                </template>
                <template #mobile-actions>
                  <Button variant="outline" size="sm" full-width>Profile</Button>
                </template>
              </Navbar>
            </div>
          </div>

          <!-- Transparent Navbar with Blur -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Transparent with Blur</h3>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-gray-800 dark:to-gray-900">
              <Navbar transparent blurred>
                <template #logo>
                  <span class="text-xl font-bold text-white">Space Vinyl</span>
                </template>
                <template #nav>
                  <a href="#" class="text-white hover:text-primary-200 transition-colors">Home</a>
                  <a href="#" class="text-white hover:text-primary-200 transition-colors">Collection</a>
                </template>
                <template #actions>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </template>
              </Navbar>
            </div>
          </div>
        </div>
      </section>

      <!-- Header Component -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Header Component</h2>

        <div class="space-y-6">
          <!-- Default Header with Search -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Default Header with Search</h3>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Header v-model:search-value="headerSearchValue">
                <template #title>My Vinyl Collection</template>
                <template #subtitle>456 albums • Last updated today</template>
                <template #actions>
                  <Button variant="outline" size="sm">Filters</Button>
                  <Button variant="primary" size="sm">Add Album</Button>
                </template>
              </Header>
            </div>
            <p class="mt-2 text-sm text-gray-500">Search value: {{ headerSearchValue || '(empty)' }}</p>
          </div>

          <!-- Gradient Header -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Gradient Header</h3>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Header variant="gradient" search-placeholder="Search albums, artists...">
                <template #title>Discover Music</template>
                <template #subtitle>Explore your collection of progressive rock vinyl</template>
                <template #actions>
                  <Badge variant="success" text="456 albums" />
                </template>
              </Header>
            </div>
          </div>

          <!-- Header without Search -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Header without Search</h3>
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Header :show-search="false">
                <template #title>Settings</template>
                <template #subtitle>Manage your account preferences</template>
              </Header>
            </div>
          </div>
        </div>
      </section>

      <!-- Code Example -->
      <section class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-soft">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Usage Example</h2>
        <pre class="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm"><code>&lt;script setup&gt;
import { Button, Badge, Input } from '@/components/ui'
import Card from '@/components/ui/Card.vue'
import Navbar from '@/components/ui/Navbar.vue'
import Header from '@/components/ui/Header.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const search = ref('')
&lt;/script&gt;

&lt;template&gt;
  &lt;!-- Card Example --&gt;
  &lt;Card variant="default" hoverable&gt;
    &lt;template #header&gt;Album Title&lt;/template&gt;
    &lt;p&gt;Album content here&lt;/p&gt;
    &lt;template #footer&gt;
      &lt;Badge variant="primary" text="Rock" /&gt;
    &lt;/template&gt;
  &lt;/Card&gt;

  &lt;!-- Header Example --&gt;
  &lt;Header v-model:search-value="search"&gt;
    &lt;template #title&gt;My Collection&lt;/template&gt;
    &lt;template #actions&gt;
      &lt;Button variant="primary"&gt;Add Album&lt;/Button&gt;
    &lt;/template&gt;
  &lt;/Header&gt;
&lt;/template&gt;</code></pre>
      </section>
    </div>
  </div>
</template>
