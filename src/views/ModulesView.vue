<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { useProgressStore } from '@/stores/progress.store'
import { modules } from '@/content/modules'

const router = useRouter()
const progressStore = useProgressStore()

onMounted(() => {
  progressStore.loadProgress()
})

function getModuleIcon(icon: string) {
  const icons: Record<string, string> = {
    anatomy: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>`,
    mindset: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
    communication: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    preparation: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`
  }
  return icons[icon] || icons.anatomy
}

function getModuleProgress(moduleId: string) {
  const moduleProgress = progressStore.getModuleProgress(moduleId)
  if (!moduleProgress) return 0
  const module = modules.find(m => m.id === moduleId)
  if (!module) return 0
  return Math.round((moduleProgress.completedLessons.length / module.lessons.length) * 100)
}

function navigateToModule(moduleId: string) {
  router.push(`/modules/${moduleId}`)
}
</script>

<template>
  <div class="modules-page page">
    <div class="container">
      <header class="modules-header">
        <h1>Learning Modules</h1>
        <p>Progress through each module at your own pace. No rush, no pressure.</p>
      </header>

      <div class="modules-grid">
        <BaseCard
          v-for="module in modules"
          :key="module.id"
          padding="lg"
          hoverable
          class="module-card"
          @click="navigateToModule(module.id)"
        >
          <div class="module-card__icon" v-html="getModuleIcon(module.icon)" />
          <div class="module-card__content">
            <div class="module-card__header">
              <h2>{{ module.title }}</h2>
              <span v-if="module.isFree" class="module-card__badge">Free</span>
            </div>
            <p class="module-card__description">{{ module.description }}</p>
            <div class="module-card__meta">
              <span>{{ module.lessons.length }} lessons</span>
              <span>•</span>
              <span>{{ module.lessons.reduce((acc, l) => acc + l.duration, 0) }} min</span>
            </div>
            <div class="module-card__progress">
              <div class="progress-bar">
                <div
                  class="progress-bar__fill"
                  :style="{ width: `${getModuleProgress(module.id)}%` }"
                />
              </div>
              <span class="progress-text">{{ getModuleProgress(module.id) }}%</span>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modules-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.modules-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-sm);
}

.modules-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.modules-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.module-card {
  display: flex;
  gap: var(--space-lg);
  cursor: pointer;
}

.module-card__icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(107, 142, 123, 0.1);
  border-radius: var(--radius-lg);
  color: var(--color-primary);
}

.module-card__content {
  flex: 1;
  min-width: 0;
}

.module-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.module-card__header h2 {
  font-size: var(--font-size-xl);
  margin: 0;
}

.module-card__badge {
  background-color: var(--color-success);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.module-card__description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.module-card__meta {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.module-card__progress {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.progress-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  min-width: 40px;
}

@media (max-width: 640px) {
  .module-card {
    flex-direction: column;
    text-align: center;
  }

  .module-card__icon {
    margin: 0 auto;
  }

  .module-card__header {
    justify-content: center;
  }

  .module-card__meta {
    justify-content: center;
  }
}
</style>
