import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { QUIZ, isValidAnswers, type QuestionKey, type QuizAnswers } from '@/guide/quiz'

/**
 * Quiz answers for the personal guide (T-0594), kept only in this browser so a
 * visitor who leaves for checkout and comes back doesn't have to start over.
 */
export const useGuideStore = defineStore('guide', () => {
  const answers = ref<Partial<Record<QuestionKey, string>>>({})

  const isComplete = computed(() => isValidAnswers(answers.value))
  const completeAnswers = computed<QuizAnswers | null>(() =>
    isValidAnswers(answers.value) ? answers.value : null
  )
  /** Index of the first unanswered question (QUIZ.length when all are answered). */
  const firstOpenIndex = computed(() => {
    const index = QUIZ.findIndex(q => !answers.value[q.key])
    return index === -1 ? QUIZ.length : index
  })

  function answer(key: QuestionKey, value: string) {
    answers.value = { ...answers.value, [key]: value }
  }

  function reset() {
    answers.value = {}
  }

  return { answers, isComplete, completeAnswers, firstOpenIndex, answer, reset }
}, {
  persist: { paths: ['answers'] }
})
