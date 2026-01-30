import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true, requiresAge: true }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true, requiresAge: true }
    },
    {
      path: '/modules',
      name: 'modules',
      component: () => import('@/views/ModulesView.vue'),
      meta: { requiresAuth: true, requiresAge: true, requiresOnboarding: true }
    },
    {
      path: '/modules/:moduleId',
      name: 'module-detail',
      component: () => import('@/views/ModuleDetailView.vue'),
      meta: { requiresAuth: true, requiresAge: true, requiresOnboarding: true }
    },
    {
      path: '/modules/:moduleId/lessons/:lessonId',
      name: 'lesson',
      component: () => import('@/views/LessonView.vue'),
      meta: { requiresAuth: true, requiresAge: true, requiresOnboarding: true }
    },
    {
      path: '/coach',
      name: 'ai-coach',
      component: () => import('@/views/AICoachView.vue'),
      meta: { requiresAuth: true, requiresAge: true, requiresOnboarding: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Wait for auth to initialize before navigation
async function waitForAuth(authStore: ReturnType<typeof useAuthStore>): Promise<void> {
  if (!authStore.isLoading) return
  return new Promise((resolve) => {
    const unwatch = watch(
      () => authStore.isLoading,
      (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      }
    )
  })
}

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize
  await waitForAuth(authStore)

  // Age verification gate - show modal instead of redirect
  if (to.meta.requiresAge && !authStore.isAgeVerified && to.query.ageGate !== 'true') {
    return next({ ...to, query: { ...to.query, ageGate: 'true' } })
  }

  // Auth guard
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // Onboarding guard
  if (to.meta.requiresOnboarding && !authStore.hasCompletedOnboarding) {
    return next({ name: 'onboarding' })
  }

  // Guest only (login page)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'home' })
  }

  next()
})

export default router
