import { createRouter, createWebHistory } from "vue-router"
import WelcomePage from "../views/WelcomePage.vue"
import CollectionView from "../views/CollectionView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "welcome",
      component: WelcomePage,
    },
    {
      path: "/collection",
      name: "collection",
      component: CollectionView,
    },
    {
      path: "/release/:id",
      name: "release",
      component: () => import("../views/ReleaseView.vue"), // To implement
    },
  ],
})

export default router
