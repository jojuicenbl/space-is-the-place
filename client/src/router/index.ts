import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../views/WelcomePage.vue'
import CollectionView from '../views/CollectionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
