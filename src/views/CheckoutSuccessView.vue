<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(true)

onMounted(async () => {
  // Refresh profile to get updated premium status
  await authStore.refreshProfile()
  isLoading.value = false

  // Redirect to AI Coach after a short delay
  setTimeout(() => {
    router.push({ name: 'ai-coach' })
  }, 3000)
})
</script>

<template>
  <div class="success-page page">
    <div class="success-container">
      <BaseCard class="success-card">
        <div class="success-content">
          <div class="success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1>Payment Successful!</h1>

          <p v-if="isLoading" class="success-message">
            Setting up your premium access...
          </p>
          <p v-else class="success-message">
            Thank you for your purchase! Your AI Coach is now unlocked.
          </p>

          <p class="success-redirect">
            Redirecting to AI Coach...
          </p>

          <RouterLink :to="{ name: 'ai-coach' }" class="success-link">
            Go to AI Coach now
          </RouterLink>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: var(--space-lg);
}

.success-container {
  width: 100%;
  max-width: 480px;
}

.success-card {
  text-align: center;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xl);
}

.success-icon {
  color: var(--color-success);
  margin-bottom: var(--space-lg);
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-content h1 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.success-message {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
  font-size: var(--font-size-lg);
}

.success-redirect {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-md);
}

.success-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.success-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}
</style>
