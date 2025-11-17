import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../views/WelcomePage.vue'
import CollectionView from '../views/CollectionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Don't auto-scroll for collection view - we handle it manually for infinite scroll
    if (to.name === 'collection') {
      return false // Prevent default scroll behavior
    }

    // For other routes, use saved position or scroll to top
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomePage,
      meta: {
        showNav: false,
        pageTransition: 'fade-slide'
      }
    },
    {
      path: '/collection',
      name: 'collection',
      component: CollectionView,
      meta: {
        showNav: true,
        pageTransition: 'fade-slide'
      }
    },
    {
      path: '/release/:id',
      name: 'release',
      component: () => import('../views/ReleaseView.vue'), // To implement
      meta: {
        showNav: true,
        pageTransition: 'fade'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        showNav: true,
        pageTransition: 'fade'
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: {
        showNav: true,
        pageTransition: 'fade'
      }
    },
    {
      path: '/components-test',
      name: 'components-test',
      component: () => import('../views/ComponentsTestView.vue'),
      meta: {
        showNav: true,
        pageTransition: 'fade'
      }
    }
  ]
})

// Navigation guard to save scroll position for infinite scroll
router.beforeEach((to, from, next) => {
  // Save scroll position when leaving collection view
  if (from.name === 'collection' && to.name === 'release') {
    const mainScroll = document.getElementById('main-scroll')
    if (mainScroll) {
      const scrollY = mainScroll.scrollTop
      console.log('[Router] 💾 Saving scroll position:', scrollY)

      // Store in sessionStorage for persistence across page refreshes
      sessionStorage.setItem('collectionScrollY', scrollY.toString())
    }
  }

  next()
})

export default router
