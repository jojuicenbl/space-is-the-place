<script setup lang="ts">
import Button from '@/components/UI/Button.vue'
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { getCollection, getFolders } from '@/services/collectionApi'
import { requestDiscogsAuth } from '@/services/authDiscogs'
import { useUserStore } from '@/stores/userStore'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isNavigating = ref(false)
const isPrefetching = ref(false)
const isConnecting = ref(false)
const showSuccessMessage = ref(false)

// Check if user just connected their Discogs account
onMounted(async () => {
  if (route.query.discogs_connected === '1') {
    showSuccessMessage.value = true
    // Reload user data to get updated Discogs info
    await userStore.loadUser()
    // Remove the query parameter
    await router.replace({ query: {} })

    // Auto-redirect to user's collection after 1.5 seconds
    setTimeout(() => {
      if (userStore.discogsIsLinked) {
        userStore.setCollectionMode('user')
        router.push('/collection?mode=user')
      }
    }, 1500)
  }
})

// Prefetch collection data to warm the cache
const prefetchCollectionData = async () => {
  if (isPrefetching.value || isNavigating.value) return

  isPrefetching.value = true

  try {
    // Fetch folders and initial collection in parallel
    await Promise.all([
      getFolders(),
      getCollection({
        page: 1,
        perPage: 48,
        folderId: 0,
        sort: 'added',
        sortOrder: 'desc'
      })
    ])
  } catch (error) {
    // Silently fail - the CollectionView will fetch again if needed
    console.debug('Prefetch completed (or failed silently)', error)
  } finally {
    isPrefetching.value = false
  }
}

const navigateToCollection = async (mode: 'demo' | 'user' = 'demo') => {
  if (isNavigating.value) return

  isNavigating.value = true

  // Set collection mode before navigation
  if (mode === 'user' && userStore.discogsIsLinked) {
    userStore.setCollectionMode('user')
  } else {
    userStore.setCollectionMode('demo')
  }

  // Start prefetching immediately on click if not already started
  if (!isPrefetching.value) {
    prefetchCollectionData()
  }

  // Small delay to let the button animation play
  await new Promise(resolve => setTimeout(resolve, 200))

  try {
    await router.push(`/collection?mode=${userStore.collectionMode}`)
  } finally {
    isNavigating.value = false
  }
}

const handleConnectDiscogs = async () => {
  if (isConnecting.value) return

  isConnecting.value = true
  try {
    await requestDiscogsAuth()
  } catch (error) {
    console.error('Failed to connect to Discogs:', error)
    alert('Failed to connect to Discogs. Please try again.')
    isConnecting.value = false
  }
}

const handleDisconnectDiscogs = async () => {
  const confirmed = confirm(
    'Are you sure you want to disconnect your Discogs account? You will need to reconnect to access your collection.'
  )

  if (!confirmed) return

  try {
    // Call backend to disconnect
    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/discogs/disconnect`)

    // Reset userStore
    userStore.discogsIsLinked = false
    userStore.discogsUsername = null
    userStore.setCollectionMode('demo')

    alert('Discogs account disconnected successfully.')
  } catch (error) {
    console.error('Failed to disconnect Discogs:', error)
    alert('Failed to disconnect from Discogs. Please try again.')
  }
}

// Optional: Prefetch on hover for desktop users (warm cache even earlier)
const handleButtonHover = () => {
  prefetchCollectionData()
}
</script>
<template>
  <div class="minimal-cosmic">
    <!-- Grid overlay subtil -->
    <div class="grid-overlay"></div>
    <main class="content">
      <header class="hero">
        <h1 class="cosmic-title">SPACE IS THE PLACE</h1>
        <p class="cosmic-subtitle">Where we escape the limitations of earthly existence</p>
      </header>
      <section class="cta-section">
        <!-- Success message when returning from Discogs OAuth -->
        <Transition name="fade">
          <div v-if="showSuccessMessage" class="success-message">
            Discogs account connected successfully!
          </div>
        </Transition>

        <!-- Discogs Status Badge (when connected) -->
        <div v-if="userStore.discogsIsLinked" class="discogs-status">
          <div class="status-badge">
            <span class="status-icon">✓</span>
            <span class="status-text">Connected as <strong>{{ userStore.discogsUsername }}</strong></span>
          </div>
          <button class="disconnect-btn" title="Disconnect Discogs account" @click="handleDisconnectDiscogs">
            Disconnect
          </button>
        </div>

        <!-- Connect Button (when not connected) -->
        <Button
          v-else
          variant="ghost"
          size="lg"
          :class="['enter-btn', 'primary-btn', { navigating: isConnecting }]"
          :disabled="isConnecting"
          @click="handleConnectDiscogs"
        >
          Connect Your Discogs Account
        </Button>

        <!-- Main CTAs -->
        <Button
          v-if="userStore.discogsIsLinked"
          variant="ghost"
          size="lg"
          :class="['enter-btn', 'user-btn', { navigating: isNavigating }]"
          :disabled="isNavigating"
          @click="navigateToCollection('user')"
        >
          View My Collection
        </Button>

        <Button
          variant="ghost"
          size="lg"
          :class="['enter-btn', 'secondary-btn', { navigating: isNavigating }]"
          :disabled="isNavigating"
          @click="navigateToCollection('demo')"
          @mouseenter="handleButtonHover"
        >
          Explore the Demo Collection
        </Button>
      </section>
    </main>
  </div>
</template>
<style scoped>
/* Container principal */
.minimal-cosmic {
  min-height: 100vh;
  background: #000000;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', sans-serif;
}

/* Grid overlay subtil */
.grid-overlay::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 1;
}

/* Ligne horizontale progressive */
.horizon-line {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ffff, transparent);
  animation: horizon-grow 3s ease-out 0.5s forwards;
  z-index: 2;
}

@keyframes horizon-grow {
  to {
    width: 80vw;
  }
}

/* Layout principal */
.content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

/* Section hero */
.hero {
  text-align: center;
  margin-bottom: 4rem;
}

/* Titre principal - typographie forte */
.cosmic-title {
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', sans-serif;
  font-weight: 900;
  font-size: clamp(8rem, 12vw, 20rem);
  line-height: 0.85;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 0 1.5rem 0;

  /* Effet text-outline + text-shadow doux */
  text-shadow:
    0 0 20px rgba(0, 255, 255, 0.3),
    2px 2px 0 rgba(0, 0, 0, 0.8);

  /* Bordure fine */
  -webkit-text-stroke: 1px rgba(0, 255, 255, 0.2);

  /* Animation subtile d'apparition */
  opacity: 0;
  transform: translateY(20px);
  animation: fade-up 1.2s ease-out 0.3s forwards;
}

/* Sous-titre */
.cosmic-subtitle {
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', sans-serif;
  font-weight: 400;
  font-size: clamp(1.1rem, 2.5vw, 1.8rem);
  line-height: 1.4;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin: 0 auto;

  /* Animation d'apparition */
  opacity: 0;
  transform: translateY(15px);
  animation: fade-up 1s ease-out 0.8s forwards;
}

/* Section CTA */
.cta-section {
  opacity: 0;
  transform: translateY(15px);
  animation: fade-up 1s ease-out 1.2s forwards;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Success message */
.success-message {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

/* Discogs Status Badge */
.discogs-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  margin-bottom: 0.5rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.2rem;
  color: #00ffff;
}

.status-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.02em;
}

.status-text strong {
  color: #ffffff;
  font-weight: 600;
}

.disconnect-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.disconnect-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  border-color: rgba(255, 0, 0, 0.5);
  color: #ff6b6b;
}

/* Bouton CTA minimal avec bordures pills */
.enter-btn {
  background: transparent !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  padding: 1.2rem 3rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  border-radius: 50px !important;
  position: relative !important;
  overflow: hidden !important;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
}

/* Hover effects - changement noir vers blanc */
.enter-btn:hover {
  background: #ffffff !important;
  border-color: #ffffff !important;
  color: #000000 !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.15) !important;
}

/* Animation de clic */
.enter-btn:active {
  transform: translateY(0) scale(0.98) !important;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Animation de chargement au clic */
.enter-btn.navigating {
  transform: scale(1) !important;
  opacity: 0.8 !important;
  pointer-events: none !important;
}

/* Animations */
@keyframes fade-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .content {
    padding: 1.5rem;
  }

  .cosmic-title {
    font-size: clamp(4rem, 15vw, 10rem);
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }

  .cosmic-subtitle {
    font-size: clamp(1rem, 4vw, 1.4rem);
    max-width: 90%;
  }

  .hero {
    margin-bottom: 3rem;
  }

  .enter-btn {
    padding: 1rem 2.5rem !important;
    font-size: 0.9rem !important;
  }

  .horizon-line {
    animation: horizon-grow 2.5s ease-out 0.5s forwards;
  }

  @keyframes horizon-grow {
    to {
      width: 90vw;
    }
  }
}

@media (max-width: 480px) {
  .cosmic-title {
    font-size: clamp(3rem, 12vw, 8rem);
    letter-spacing: 0.08em;
  }

  .cosmic-subtitle {
    font-size: clamp(0.95rem, 3.5vw, 1.2rem);
  }

  .enter-btn {
    padding: 0.9rem 2rem !important;
    font-size: 0.85rem !important;
  }
}

/* Performance : réduction des animations sur demande */
@media (prefers-reduced-motion: reduce) {
  .cosmic-title,
  .cosmic-subtitle,
  .cta-section {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .horizon-line {
    animation: none;
    width: 80vw;
  }

  .enter-btn {
    transition: none !important;
  }
}
</style>
