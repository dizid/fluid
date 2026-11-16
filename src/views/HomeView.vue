<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { useProgressStore } from '@/stores/progress.store'

const router = useRouter()
const progressStore = useProgressStore()

const progress = computed(() => progressStore.overallProgress)

function navigateToModules() {
  router.push('/modules')
}
</script>

<template>
  <div class="home-page page">
    <div class="container">
      <header class="home-header">
        <h1>Welcome to Fluid Intimacy</h1>
        <p>A free, private course on pleasure, arousal and connection. No account needed: your progress stays on this device.</p>
      </header>

      <section class="progress-section">
        <BaseCard padding="lg">
          <div class="progress-card">
            <div class="progress-info">
              <h2>Your Progress</h2>
              <p class="progress-percentage">{{ progress }}%</p>
            </div>
            <div class="progress-bar">
              <div class="progress-bar__fill" :style="{ width: `${progress}%` }" />
            </div>
            <p class="progress-hint">
              {{ progress === 0 ? 'Start your first module to begin tracking progress.' : 'Keep going! You\'re doing great.' }}
            </p>
          </div>
        </BaseCard>
      </section>

      <section class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <BaseCard padding="lg" hoverable class="action-card" @click="navigateToModules">
            <div class="action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3>Continue Learning</h3>
            <p>Pick up where you left off in your modules.</p>
          </BaseCard>

        </div>
      </section>

      <section class="tips-section">
        <h2>Remember</h2>
        <BaseCard padding="lg">
          <ul class="tips-list">
            <li>
              <strong>No pressure.</strong> Pleasure should never feel like a performance.
            </li>
            <li>
              <strong>Every body is different.</strong> What works for others may not work for you, and that's okay.
            </li>
            <li>
              <strong>Communication is key.</strong> Talk openly with your partner about boundaries and desires.
            </li>
            <li>
              <strong>Take your time.</strong> There's no rush. Enjoy the journey of discovery.
            </li>
          </ul>
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.home-header h1 {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-sm);
}

.home-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

/* Progress Section */
.progress-section {
  margin-bottom: var(--space-2xl);
}

.progress-card {
  text-align: center;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.progress-info h2 {
  font-size: var(--font-size-lg);
}

.progress-percentage {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.progress-bar {
  height: 12px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-md);
}

.progress-bar__fill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.progress-hint {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Quick Actions */
.quick-actions {
  margin-bottom: var(--space-2xl);
}

.quick-actions h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-lg);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.action-card {
  cursor: pointer;
  text-align: center;
}

.action-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-md);
}

.action-card h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-sm);
}

.action-card p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

/* Tips Section */
.tips-section h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-lg);
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.tips-list li {
  position: relative;
  padding-left: var(--space-lg);
  line-height: var(--line-height-relaxed);
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-size: var(--font-size-lg);
}

.tips-list strong {
  color: var(--color-text-primary);
}
</style>
