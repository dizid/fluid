<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useProgressStore } from '@/stores/progress.store'
import { getModule } from '@/content/modules'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()

const moduleId = computed(() => route.params.moduleId as string)
const module = computed(() => getModule(moduleId.value))

onMounted(() => {
  progressStore.loadProgress()
  if (module.value) {
    progressStore.startModule(moduleId.value)
  }
})

function isLessonCompleted(lessonId: string) {
  return progressStore.isLessonCompleted(moduleId.value, lessonId)
}

function navigateToLesson(lessonId: string) {
  router.push(`/modules/${moduleId.value}/lessons/${lessonId}`)
}

function goBack() {
  router.push('/modules')
}
</script>

<template>
  <div class="module-detail-page page">
    <div class="container">
      <button class="back-button" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Modules
      </button>

      <template v-if="module">
        <header class="module-header">
          <h1>{{ module.title }}</h1>
          <p>{{ module.description }}</p>
        </header>

        <div class="lessons-list">
          <BaseCard
            v-for="(lesson, index) in module.lessons"
            :key="lesson.id"
            padding="lg"
            hoverable
            class="lesson-card"
            :class="{ 'lesson-card--completed': isLessonCompleted(lesson.id) }"
            @click="navigateToLesson(lesson.id)"
          >
            <div class="lesson-card__number">
              <span v-if="isLessonCompleted(lesson.id)" class="lesson-card__check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="lesson-card__content">
              <h3>{{ lesson.title }}</h3>
              <p>{{ lesson.description }}</p>
              <span class="lesson-card__duration">{{ lesson.duration }} min</span>
            </div>
            <div class="lesson-card__arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </BaseCard>
        </div>
      </template>

      <template v-else>
        <div class="not-found">
          <h2>Module not found</h2>
          <BaseButton @click="goBack">Back to Modules</BaseButton>
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

.module-header {
  margin-bottom: var(--space-2xl);
}

.module-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-sm);
}

.module-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.lesson-card {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  cursor: pointer;
}

.lesson-card--completed {
  opacity: 0.8;
}

.lesson-card__number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(107, 142, 123, 0.1);
  border-radius: 50%;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.lesson-card--completed .lesson-card__number {
  background-color: var(--color-success);
  color: white;
}

.lesson-card__check {
  display: flex;
}

.lesson-card__content {
  flex: 1;
  min-width: 0;
}

.lesson-card__content h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-xs);
}

.lesson-card__content p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-xs);
}

.lesson-card__duration {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.lesson-card__arrow {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.not-found {
  text-align: center;
  padding: var(--space-3xl);
}

.not-found h2 {
  margin-bottom: var(--space-lg);
}
</style>
