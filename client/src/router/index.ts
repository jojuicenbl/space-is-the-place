import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../views/WelcomePage.vue'
import CollectionView from '../views/CollectionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    // Le scroll to top est géré par le hook @after-leave de la transition dans App.vue
    // Ici on gère uniquement la restauration de position pour le bouton retour
    if (savedPosition) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mainScroll = document.getElementById('main-scroll')
          if (mainScroll) {
            mainScroll.scrollTop = savedPosition.top
          }
          resolve({ top: savedPosition.top, left: 0 })
        }, 300)
      })
    }
    // Ne rien faire pour les nouvelles navigations (géré par la transition)
    return undefined
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

export default router
