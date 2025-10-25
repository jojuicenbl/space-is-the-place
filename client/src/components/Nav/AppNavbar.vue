<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const goToHome = () => {
  router.push('/collection')
}

const goToCollection = () => {
  router.push('/collection')
}

const goToAbout = () => {
  router.push('/about')
}

const goToContact = () => {
  router.push('/contact')
}

const isCurrentRoute = (routeName: string) => {
  return route.name === routeName
}

const hasScrolled = ref(false)
let scrollTarget: HTMLElement | null = null

const handleScroll = () => {
  if (scrollTarget) {
    hasScrolled.value = scrollTarget.scrollTop > 0
  }
}

onMounted(() => {
  scrollTarget = document.getElementById('main-scroll')
  if (scrollTarget) {
    scrollTarget.addEventListener('scroll', handleScroll)
    handleScroll()
  }
})

onUnmounted(() => {
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', handleScroll)
  }
})
</script>
<template>
  <nav class="app-navbar" :class="{ 'scrolled': hasScrolled }">
    <div class="navbar-container">
      <div class="navbar-left">
        <button class="logo-button" @click="goToHome">
          <img src="/space-is-the-place-logo.png" alt="Space Is The Place Logo" />
        </button>
      </div>
      <div class="navbar-right">
        <div class="nav-links">
          <button class="nav-button nav-link" :class="{ active: isCurrentRoute('collection') }" @click="goToCollection">
            Collection
          </button>
          <button class="nav-button nav-link" :class="{ active: isCurrentRoute('about') }" @click="goToAbout">
            About
          </button>
          <button class="nav-button nav-link" :class="{ active: isCurrentRoute('contact') }" @click="goToContact">
            Contact
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(247, 247, 249, 0.85);
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.app-navbar.scrolled {
  border-bottom: 1.5px solid #e5e5e5;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  height: 60px;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.logo-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-button img {
  height: 65px;
  width: auto;
  object-fit: contain;
}

.logo-button:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', sans-serif;
  font-weight: 700;
}

.nav-link {
  color: #666;
  position: relative;
}

.nav-link:hover {
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.active {
  color: #1a1a1a;
  background-color: rgba(0, 0, 0, 0.1);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  /* background-color: hsla(160, 100%, 37%, 1); */
  border-radius: 1px;
}

/* Responsive design */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-button {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  .logo-button {
    padding: 0.25rem;
  }

  .logo-button img {
    height: 32px;
  }
}

@media (max-width: 600px) {
  .navbar-container {
    padding: 0.5rem 0.75rem;
    height: 50px;
  }

  .nav-links {
    gap: 0.5rem;
  }

  .nav-button {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }

  .logo-button img {
    height: 28px;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 0.25rem;
  }

  .nav-button {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>
