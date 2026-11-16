import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
  // Progress is saved in this browser only (pinia-plugin-persistedstate, persist: true
  // below); there are no accounts since T-0594. This just stamps the last activity.
  function saveProgress() {
    progress.value.lastActiveAt = new Date().toISOString()
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
      saveProgress()
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

    saveProgress()
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
    startModule,
    completeLesson
  }
}, {
  persist: true
})
