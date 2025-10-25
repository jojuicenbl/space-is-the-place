<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const isNavigating = ref(false)

const navigateToCollection = async () => {
  if (isNavigating.value) return

  isNavigating.value = true

  // lil' delay to let the animation play
  await new Promise(resolve => setTimeout(resolve, 200))

  try {
    await router.push('/collection')
  } finally {
    isNavigating.value = false
  }
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
        <Button
          variant="ghost"
          size="lg"
          :class="['enter-btn', { navigating: isNavigating }]"
          :disabled="isNavigating"
          @click="navigateToCollection"
        >
          Enter My Universe
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
