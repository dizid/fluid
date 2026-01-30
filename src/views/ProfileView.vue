<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useProgressStore } from '@/stores/progress.store'

const router = useRouter()
const authStore = useAuthStore()
const progressStore = useProgressStore()

const profile = computed(() => authStore.profile)
const progress = computed(() => progressStore.overallProgress)

const userType = computed(() => {
  return profile.value?.onboarding?.userType === 'couple' ? 'Couple Mode' : 'Solo Mode'
})

const memberSince = computed(() => {
  if (!profile.value?.createdAt) return ''
  return new Date(profile.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
})

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <div class="profile-page page">
    <div class="container">
      <header class="profile-header">
        <h1>Profile</h1>
      </header>

      <div class="profile-grid">
        <BaseCard padding="lg" class="profile-card">
          <div class="profile-avatar">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            </svg>
          </div>
          <h2>{{ profile?.email }}</h2>
          <p class="profile-meta">{{ userType }} • Member since {{ memberSince }}</p>
        </BaseCard>

        <BaseCard padding="lg">
          <h3>Learning Progress</h3>
          <div class="progress-display">
            <div class="progress-circle">
              <svg viewBox="0 0 36 36" class="circular-chart">
                <path
                  class="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  class="circle"
                  :stroke-dasharray="`${progress}, 100`"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" class="percentage">{{ progress }}%</text>
              </svg>
            </div>
            <p>{{ progress === 0 ? 'Start your first module to begin!' : progress === 100 ? 'Congratulations! You\'ve completed all modules.' : 'Keep going! You\'re making great progress.' }}</p>
          </div>
        </BaseCard>

        <BaseCard padding="lg">
          <h3>Your Goals</h3>
          <ul v-if="profile?.onboarding?.goals?.length" class="goals-list">
            <li v-for="goal in profile.onboarding.goals" :key="goal">
              {{ goal.charAt(0).toUpperCase() + goal.slice(1).replace(/-/g, ' ') }}
            </li>
          </ul>
          <p v-else class="no-data">No goals set</p>
        </BaseCard>

        <BaseCard padding="lg">
          <h3>Account Settings</h3>
          <div class="settings-list">
            <div class="setting-item">
              <span>Email</span>
              <span>{{ profile?.email }}</span>
            </div>
            <div class="setting-item">
              <span>Premium Status</span>
              <span :class="profile?.isPremium ? 'status-active' : 'status-inactive'">
                {{ profile?.isPremium ? 'Active' : 'Free Tier' }}
              </span>
            </div>
          </div>
          <BaseButton
            variant="outline"
            full-width
            class="sign-out-btn"
            @click="handleSignOut"
          >
            Sign Out
          </BaseButton>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  margin-bottom: var(--space-2xl);
}

.profile-header h1 {
  font-size: var(--font-size-3xl);
}

.profile-grid {
  display: grid;
  gap: var(--space-lg);
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.profile-card {
  text-align: center;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-md);
  background-color: rgba(107, 142, 123, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.profile-card h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-xs);
}

.profile-meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Progress */
.progress-display {
  text-align: center;
}

.progress-circle {
  width: 120px;
  height: 120px;
  margin: var(--space-lg) auto;
}

.circular-chart {
  display: block;
  margin: 0 auto;
  max-width: 100%;
}

.circle-bg {
  fill: none;
  stroke: rgba(0, 0, 0, 0.1);
  stroke-width: 3.8;
}

.circle {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 3.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.percentage {
  fill: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: 0.5em;
  font-weight: var(--font-weight-semibold);
  text-anchor: middle;
}

/* Goals */
h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-md);
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.goals-list li {
  position: relative;
  padding-left: var(--space-lg);
  color: var(--color-text-secondary);
}

.goals-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--color-success);
}

.no-data {
  color: var(--color-text-muted);
  font-style: italic;
}

/* Settings */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.setting-item span:first-child {
  color: var(--color-text-secondary);
}

.status-active {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.status-inactive {
  color: var(--color-text-muted);
}

.sign-out-btn {
  margin-top: var(--space-md);
}
</style>
