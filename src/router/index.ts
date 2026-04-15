import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '@/views/MenuView.vue'
import { useCafeStore } from '@/stores/cafe'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuView,
      meta: { requiresLocation: true },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: { requiresLocation: true },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: { requiresLocation: true },
    },
    {
      path: '/invalid',
      name: 'invalid',
      component: () => import('@/views/InvalidAccessView.vue'),
    },
  ],
  scrollBehavior(to) {
    // For landing page hash links
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

// Route guard: validate cafe_id + table_id, fetch API data
router.beforeEach(async (to) => {
  if (!to.meta.requiresLocation) return

  const { cafe_id, table_id } = to.query
  const hasCafe = typeof cafe_id === 'string' && cafe_id.trim().length > 0
  const hasTable = typeof table_id === 'string' && table_id.trim().length > 0

  if (!hasCafe || !hasTable) {
    return { name: 'invalid' }
  }

  const cafeStore = useCafeStore()

  // Only fetch once (or re-fetch if params changed)
  if (!cafeStore.isLoaded || cafeStore.cafe?.unique_id !== cafe_id) {
    try {
      await cafeStore.fetchCafeData(cafe_id, table_id)
    } catch {
      return { name: 'invalid' }
    }
  }
})

export default router
