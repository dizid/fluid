<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const isConfirmed = ref(false)

async function handleConfirm() {
  if (!isConfirmed.value) return
  await authStore.verifyAge()
  // Re-navigate to trigger route guards
  router.replace(router.currentRoute.value.fullPath.replace('?ageGate=true', ''))
}

function handleDecline() {
  window.location.href = 'https://google.com'
}
</script>

<template>
  <BaseModal :show="true" :closable="false" size="md">
    <div class="age-gate">
      <div class="age-gate__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      <h1 class="age-gate__title">Age Verification Required</h1>

      <p class="age-gate__description">
        This website contains educational content about sexual wellness intended for adults only.
        By entering, you confirm that you are at least 18 years old (or the age of majority in your jurisdiction).
      </p>

      <label class="age-gate__checkbox">
        <input v-model="isConfirmed" type="checkbox" />
        <span>I confirm that I am 18 years of age or older</span>
      </label>

      <div class="age-gate__actions">
        <BaseButton
          variant="primary"
          size="lg"
          full-width
          :disabled="!isConfirmed"
          @click="handleConfirm"
        >
          Enter Site
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="lg"
          full-width
          @click="handleDecline"
        >
          Exit
        </BaseButton>
      </div>

      <p class="age-gate__disclaimer">
        This site provides educational information only and is not a substitute for professional medical advice.
      </p>
    </div>
  </BaseModal>
</template>

<style scoped>
.age-gate {
  text-align: center;
  padding: var(--space-lg);
}

.age-gate__icon {
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
}

.age-gate__title {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
}

.age-gate__description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-xl);
}

.age-gate__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  cursor: pointer;
}

.age-gate__checkbox input {
  width: 20px;
  height: 20px;
  accent-color: var(--color-primary);
}

.age-gate__checkbox span {
  font-weight: var(--font-weight-medium);
}

.age-gate__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.age-gate__disclaimer {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
