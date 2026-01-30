<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import { useProgressStore } from '@/stores/progress.store'
import { getModule, getLesson } from '@/content/modules'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()

const moduleId = computed(() => route.params.moduleId as string)
const lessonId = computed(() => route.params.lessonId as string)
const module = computed(() => getModule(moduleId.value))
const lesson = computed(() => getLesson(moduleId.value, lessonId.value))

const reflectionInputs = ref<Record<number, string>>({})

const nextLesson = computed(() => {
  if (!module.value || !lesson.value) return null
  const currentIndex = module.value.lessons.findIndex(l => l.id === lessonId.value)
  return module.value.lessons[currentIndex + 1] ?? null
})

const prevLesson = computed(() => {
  if (!module.value || !lesson.value) return null
  const currentIndex = module.value.lessons.findIndex(l => l.id === lessonId.value)
  return module.value.lessons[currentIndex - 1] ?? null
})

onMounted(() => {
  progressStore.loadProgress()
})

async function completeLesson() {
  if (!module.value) return
  await progressStore.completeLesson(
    moduleId.value,
    lessonId.value,
    module.value.lessons.length
  )
}

function goToNextLesson() {
  completeLesson()
  if (nextLesson.value) {
    router.push(`/modules/${moduleId.value}/lessons/${nextLesson.value.id}`)
  } else {
    router.push(`/modules/${moduleId.value}`)
  }
}

function goToPrevLesson() {
  if (prevLesson.value) {
    router.push(`/modules/${moduleId.value}/lessons/${prevLesson.value.id}`)
  }
}

function goBackToModule() {
  router.push(`/modules/${moduleId.value}`)
}

function getCalloutClass(variant: string) {
  return `callout--${variant}`
}
</script>

<template>
  <div class="lesson-page page">
    <div class="container">
      <button class="back-button" @click="goBackToModule">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to {{ module?.title }}
      </button>

      <template v-if="lesson">
        <article class="lesson-content">
          <header class="lesson-header">
            <span class="lesson-meta">{{ module?.title }}</span>
            <h1>{{ lesson.title }}</h1>
            <p class="lesson-duration">{{ lesson.duration }} minute read</p>
          </header>

          <div class="lesson-body">
            <template v-for="(block, index) in lesson.content" :key="index">
              <!-- Heading -->
              <component
                v-if="block.type === 'heading'"
                :is="`h${block.level}`"
                class="content-heading"
              >
                {{ block.content }}
              </component>

              <!-- Text -->
              <p v-else-if="block.type === 'text'" class="content-text">
                {{ block.content }}
              </p>

              <!-- Callout -->
              <div
                v-else-if="block.type === 'callout'"
                class="callout"
                :class="getCalloutClass(block.variant)"
              >
                <div class="callout__icon">
                  <svg v-if="block.variant === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <svg v-else-if="block.variant === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" />
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <div class="callout__content" v-html="block.content.replace(/\n/g, '<br>')" />
              </div>

              <!-- Reflection -->
              <div v-else-if="block.type === 'reflection'" class="reflection">
                <h4 class="reflection__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Reflection
                </h4>
                <p class="reflection__prompt">{{ block.prompt }}</p>
                <textarea
                  v-model="reflectionInputs[index]"
                  class="reflection__input"
                  :placeholder="block.placeholder ?? 'Write your thoughts here... (your reflections are private)'"
                  rows="4"
                />
              </div>
            </template>
          </div>

          <footer class="lesson-footer">
            <BaseButton
              v-if="prevLesson"
              variant="ghost"
              @click="goToPrevLesson"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Previous
            </BaseButton>
            <div v-else />

            <BaseButton
              variant="primary"
              @click="goToNextLesson"
            >
              {{ nextLesson ? 'Continue' : 'Complete Module' }}
              <svg v-if="nextLesson" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </BaseButton>
          </footer>
        </article>
      </template>

      <template v-else>
        <div class="not-found">
          <h2>Lesson not found</h2>
          <BaseButton @click="goBackToModule">Back to Module</BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xl);
  transition: color var(--transition-fast);
}

.back-button:hover {
  color: var(--color-primary);
}

.lesson-content {
  max-width: 700px;
  margin: 0 auto;
}

.lesson-header {
  margin-bottom: var(--space-2xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.lesson-meta {
  display: inline-block;
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.lesson-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-sm);
}

.lesson-duration {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

/* Content blocks */
.lesson-body {
  line-height: var(--line-height-relaxed);
}

.content-heading {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
}

.content-text {
  margin-bottom: var(--space-lg);
  color: var(--color-text-primary);
}

/* Callouts */
.callout {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.callout--info {
  background-color: rgba(107, 142, 123, 0.1);
  border-left: 4px solid var(--color-primary);
}

.callout--info .callout__icon {
  color: var(--color-primary);
}

.callout--warning {
  background-color: rgba(253, 203, 110, 0.2);
  border-left: 4px solid var(--color-warning);
}

.callout--warning .callout__icon {
  color: #e67e22;
}

.callout--tip {
  background-color: rgba(0, 184, 148, 0.1);
  border-left: 4px solid var(--color-success);
}

.callout--tip .callout__icon {
  color: var(--color-success);
}

.callout__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.callout__content {
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* Reflection */
.reflection {
  background-color: var(--color-surface);
  border: 2px solid rgba(107, 142, 123, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin: var(--space-xl) 0;
}

.reflection__title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-base);
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.reflection__prompt {
  font-style: italic;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.reflection__input {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.reflection__input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Footer */
.lesson-footer {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.not-found {
  text-align: center;
  padding: var(--space-3xl);
}

.not-found h2 {
  margin-bottom: var(--space-lg);
}
</style>
