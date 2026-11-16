import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * The visitor's own settings, kept only in this browser (T-0594: the course is
 * open, there are no accounts). Only the 18+ confirmation lives here; lesson
 * progress is in progress.store.ts, also local.
 */
export const useVisitorStore = defineStore('visitor', () => {
  const isAgeVerified = ref(false)

  function verifyAge() {
    isAgeVerified.value = true
  }

  return { isAgeVerified, verifyAge }
}, {
  persist: {
    paths: ['isAgeVerified']
  }
})
