<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useGuideStore } from '@/stores/guide.store'
import { getLesson, getModule } from '@/content/modules'
import {
  QUIZ, PRODUCTS, COUPLES_ADDON_CENTS, LESSONS_BY_GOAL,
  totalCents, formatEuro, optionLabel, type ProductKey
} from '@/guide/quiz'
import { GUIDE_COPY } from '@/guide/copy'

/**
 * /guide (T-0594): a free 5-question quiz, then the option to buy a personal PDF
 * guide built from the answers. Answers stay in this browser until checkout.
 */
const route = useRoute()
const guideStore = useGuideStore()

// Start at the first unanswered question; finished quizzes open on the result.
const step = ref(guideStore.firstOpenIndex)
const question = computed(() => QUIZ[step.value])
const showResult = computed(() => step.value >= QUIZ.length && guideStore.isComplete)

const product = ref<ProductKey>('guide')
const couples = ref(guideStore.answers.for === 'together')
const isPaying = ref(false)
const payError = ref('')
const cancelled = computed(() => route.query.cancelled === '1')

// A couple reading together gets the couples edition ticked by default.
watch(() => guideStore.answers.for, (who) => { couples.value = who === 'together' })

const total = computed(() => formatEuro(totalCents(product.value, couples.value)))

const pairedLessons = computed(() => {
  const goal = guideStore.answers.goal
  if (!goal) return []
  return (LESSONS_BY_GOAL[goal] ?? []).flatMap(([moduleId, lessonId]) => {
    const module = getModule(moduleId)
    const lesson = getLesson(moduleId, lessonId)
    return module && lesson ? [{ module, lesson }] : []
  })
})

function choose(value: string) {
  if (!question.value) return
  guideStore.answer(question.value.key, value)
  step.value += 1
}

function back() {
  if (step.value > 0) step.value -= 1
}

function startOver() {
  guideStore.reset()
  step.value = 0
}

async function buy() {
  const answers = guideStore.completeAnswers
  if (!answers || isPaying.value) return
  isPaying.value = true
  payError.value = ''
  try {
    const response = await fetch('/api/guide-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: product.value, couples: couples.value, answers })
    })
    const data = await response.json().catch(() => null)
    if (response.ok && data?.url) {
      window.location.href = data.url
      return
    }
    payError.value = data?.error ?? 'Payments are not available right now. Please try again later.'
  } catch {
    payError.value = 'No connection. Please check your internet and try again.'
  }
  isPaying.value = false
}
</script>

<template>
  <div class="guide-page page">
    <div class="container">
      <header class="guide-header">
        <p class="guide-eyebrow">Free quiz · 1 minute</p>
        <h1>Your personal guide</h1>
        <p>{{ GUIDE_COPY.quizIntro }}</p>
      </header>

      <!-- Quiz: one question at a time -->
      <BaseCard v-if="!showResult && question" padding="lg" class="quiz-card">
        <p class="quiz-step">Question {{ step + 1 }} of {{ QUIZ.length }}</p>
        <div class="quiz-bar"><div class="quiz-bar__fill" :style="{ width: `${(step / QUIZ.length) * 100}%` }" /></div>
        <h2 class="quiz-question">{{ question.question }}</h2>
        <div class="quiz-options" role="list">
          <button
            v-for="option in question.options"
            :key="option.value"
            type="button"
            role="listitem"
            class="quiz-option"
            :class="{ 'quiz-option--chosen': guideStore.answers[question.key] === option.value }"
            @click="choose(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
        <button v-if="step > 0" type="button" class="link-button" @click="back">← Back</button>
      </BaseCard>

      <!-- Result: free lesson picks + the paid PDF -->
      <template v-else-if="showResult">
        <BaseCard padding="lg" class="result-card">
          <h2>Your answers</h2>
          <ul class="answer-list">
            <li v-for="q in QUIZ" :key="q.key">
              <span class="answer-list__q">{{ q.question }}</span>
              <span>{{ optionLabel(q.key, guideStore.answers[q.key] ?? '') }}</span>
            </li>
          </ul>
          <button type="button" class="link-button" @click="startOver">Change my answers</button>
        </BaseCard>

        <BaseCard v-if="pairedLessons.length" padding="lg" class="result-card">
          <h2>Free lessons for your focus</h2>
          <ol class="lesson-picks">
            <li v-for="item in pairedLessons" :key="item.lesson.id">
              <router-link :to="`/modules/${item.module.id}/lessons/${item.lesson.id}`">{{ item.lesson.title }}</router-link>
              <span class="lesson-picks__meta">{{ item.module.title }} · {{ item.lesson.duration }} min</span>
            </li>
          </ol>
        </BaseCard>

        <BaseCard padding="lg" class="result-card buy-card">
          <h2>Get your guide as a PDF</h2>
          <p v-if="cancelled" class="notice">Payment cancelled. Nothing was charged; your answers are still here.</p>

          <div class="product-options">
            <label class="product-option" :class="{ 'product-option--chosen': product === 'guide' }">
              <input v-model="product" type="radio" value="guide" />
              <span class="product-option__body">
                <span class="product-option__title">{{ PRODUCTS.guide.name }} <strong>{{ formatEuro(PRODUCTS.guide.priceCents) }}</strong></span>
                <span class="product-option__text">{{ GUIDE_COPY.guide }}</span>
              </span>
            </label>
            <label class="product-option" :class="{ 'product-option--chosen': product === 'deepdive' }">
              <input v-model="product" type="radio" value="deepdive" />
              <span class="product-option__body">
                <span class="product-option__title">{{ PRODUCTS.deepdive.name }} <strong>{{ formatEuro(PRODUCTS.deepdive.priceCents) }}</strong></span>
                <span class="product-option__text">{{ GUIDE_COPY.deepdive }}</span>
              </span>
            </label>
          </div>

          <label class="couples-option">
            <input v-model="couples" type="checkbox" />
            <span>
              <strong>Couples edition +{{ formatEuro(COUPLES_ADDON_CENTS) }}</strong>
              <span class="product-option__text">{{ GUIDE_COPY.couples }}</span>
            </span>
          </label>

          <BaseButton full-width size="lg" :loading="isPaying" @click="buy">Get my PDF · {{ total }}</BaseButton>
          <p v-if="payError" class="error" role="alert">{{ payError }}</p>
          <p class="fine-print">One-time payment, secure checkout by Stripe. Instant download, no account, no subscription.</p>
        </BaseCard>

        <section class="faq">
          <h2>Questions</h2>
          <div v-for="item in GUIDE_COPY.faq" :key="item.q" class="faq__item">
            <h3>{{ item.q }}</h3>
            <p>{{ item.a }}</p>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.guide-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.guide-eyebrow {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-xs);
}

.guide-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-sm);
}

.guide-header p {
  color: var(--color-text-secondary);
}

.quiz-step {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.quiz-bar {
  height: 6px;
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-lg);
}

.quiz-bar__fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width var(--transition-slow);
}

.quiz-question {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-lg);
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.quiz-option {
  text-align: left;
  padding: var(--space-md) var(--space-lg);
  min-height: 52px;
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.quiz-option:hover,
.quiz-option:focus-visible {
  border-color: var(--color-primary);
}

.quiz-option--chosen {
  border-color: var(--color-primary);
  background-color: rgba(107, 142, 123, 0.08);
}

.link-button {
  background: none;
  border: none;
  padding: var(--space-xs) 0;
  color: var(--color-primary-dark);
  font-size: var(--font-size-sm);
  text-decoration: underline;
  cursor: pointer;
}

.result-card {
  margin-bottom: var(--space-lg);
}

.result-card h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-md);
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.answer-list li {
  display: flex;
  flex-direction: column;
}

.answer-list__q,
.lesson-picks__meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.lesson-picks {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-left: var(--space-lg);
  list-style: decimal;
}

.lesson-picks li {
  display: flex;
  flex-direction: column;
}

.lesson-picks a {
  color: var(--color-primary-dark);
  font-weight: var(--font-weight-semibold);
}

.product-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.product-option,
.couples-option {
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  padding: var(--space-md);
  border: 1.5px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-md);
  cursor: pointer;
}

.product-option--chosen {
  border-color: var(--color-primary);
  background-color: rgba(107, 142, 123, 0.08);
}

.product-option input,
.couples-option input {
  margin-top: 4px;
  accent-color: var(--color-primary);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.product-option__body,
.couples-option > span {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.product-option__title {
  font-weight: var(--font-weight-semibold);
}

.product-option__title strong {
  color: var(--color-primary-dark);
  white-space: nowrap;
}

.product-option__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: normal;
}

.couples-option {
  margin-bottom: var(--space-lg);
  border-style: dashed;
}

.notice {
  background-color: rgba(107, 142, 123, 0.1);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-md);
}

.error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-sm);
}

.fine-print {
  margin-top: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
}

.faq {
  margin-top: var(--space-xl);
}

.faq h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-md);
}

.faq__item {
  margin-bottom: var(--space-md);
}

.faq__item h3 {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-xs);
}

.faq__item p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
