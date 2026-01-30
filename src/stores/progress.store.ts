import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './auth.store'
import type { UserProgress, ModuleProgress } from '@/types'

export const useProgressStore = defineStore('progress', () => {
  // State
  const progress = ref<UserProgress>({
    modules: {},
    lastActiveAt: new Date().toISOString()
  })
  const isLoading = ref(false)

  // Getters
  const getModuleProgress = computed(() => (moduleId: string): ModuleProgress | null => {
    return progress.value.modules[moduleId] ?? null
  })

  const isLessonCompleted = computed(() => (moduleId: string, lessonId: string): boolean => {
    const moduleProgress = progress.value.modules[moduleId]
    return moduleProgress?.completedLessons.includes(lessonId) ?? false
  })

  const overallProgress = computed(() => {
    const modules = Object.values(progress.value.modules)
    if (modules.length === 0) return 0
    const completed = modules.filter(m => m.completed).length
    return Math.round((completed / 4) * 100) // 4 modules in MVP
  })

  // Actions
  async function loadProgress() {
    const authStore = useAuthStore()
    if (!authStore.userId) return

    isLoading.value = true
    try {
      const docRef = doc(db, 'progress', authStore.userId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        progress.value = docSnap.data() as UserProgress
      }
    } catch (e) {
      console.error('Error loading progress:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function saveProgress() {
    const authStore = useAuthStore()
    if (!authStore.userId) return

    progress.value.lastActiveAt = new Date().toISOString()
    try {
      await setDoc(doc(db, 'progress', authStore.userId), progress.value)
    } catch (e) {
      console.error('Error saving progress:', e)
    }
  }

  async function startModule(moduleId: string) {
    if (!progress.value.modules[moduleId]) {
      progress.value.modules[moduleId] = {
        started: true,
        startedAt: new Date().toISOString(),
        completedLessons: [],
        completed: false,
        completedAt: null
      }
      await saveProgress()
    }
  }

  async function completeLesson(moduleId: string, lessonId: string, totalLessons: number) {
    // Ensure module is started
    if (!progress.value.modules[moduleId]) {
      await startModule(moduleId)
    }

    const moduleProgress = progress.value.modules[moduleId]
    if (!moduleProgress) return

    // Add lesson if not already completed
    if (!moduleProgress.completedLessons.includes(lessonId)) {
      moduleProgress.completedLessons.push(lessonId)
    }

    // Check if module is complete
    if (moduleProgress.completedLessons.length >= totalLessons) {
      moduleProgress.completed = true
      moduleProgress.completedAt = new Date().toISOString()
    }

    await saveProgress()
  }

  return {
    // State
    progress,
    isLoading,
    // Getters
    getModuleProgress,
    isLessonCompleted,
    overallProgress,
    // Actions
    loadProgress,
    startModule,
    completeLesson
  }
}, {
  persist: true
})
