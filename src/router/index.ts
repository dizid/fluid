import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useVisitorStore } from '@/stores/visitor.store'
import { applyPageMeta } from '@/seo/meta'

/**
 * Open course (T-0594): every page is public, no account. The only gate left is
 * the 18+ confirmation (adult topic), kept in this browser by the visitor store.
 */
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAge: true }
    },
    {
      path: '/modules',
      name: 'modules',
      component: () => import('@/views/ModulesView.vue'),
      meta: { requiresAge: true }
    },
    {
      path: '/modules/:moduleId',
      name: 'module-detail',
      component: () => import('@/views/ModuleDetailView.vue'),
      meta: { requiresAge: true }
    },
    {
      path: '/modules/:moduleId/lessons/:lessonId',
      name: 'lesson',
      component: () => import('@/views/LessonView.vue'),
      meta: { requiresAge: true }
    },
    // Old account-era pages (login, AI coach, profile, onboarding, checkout)
    // no longer exist; send old bookmarks to the course instead of a blank page.
    { path: '/login', redirect: '/' },
    { path: '/onboarding', redirect: '/' },
    { path: '/coach', redirect: '/modules' },
    { path: '/profile', redirect: '/' },
    { path: '/checkout/:rest(.*)*', redirect: '/' },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to: RouteLocationNormalized) => {
  const visitorStore = useVisitorStore()

  // Age confirmation: show the modal (via ?ageGate=true) instead of redirecting,
  // so the page itself still loads underneath.
  if (to.meta.requiresAge && !visitorStore.isAgeVerified && to.query.ageGate !== 'true') {
    return { ...to, query: { ...to.query, ageGate: 'true' } }
  }
  return true
})

// Title, description and canonical per page (the same values the build writes
// into the static HTML, see build/prerender.ts).
router.afterEach((to) => {
  applyPageMeta(to.path)
})

export default router
