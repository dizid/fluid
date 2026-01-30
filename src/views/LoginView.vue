<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')

const redirect = computed(() => (route.query.redirect as string) || '/')

const passwordError = computed(() => {
  if (isSignUp.value && confirmPassword.value && password.value !== confirmPassword.value) {
    return 'Passwords do not match'
  }
  return ''
})

async function handleSubmit() {
  if (isSignUp.value && password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    if (isSignUp.value) {
      await authStore.signUp(email.value, password.value)
    } else {
      await authStore.signIn(email.value, password.value)
    }
    router.push(redirect.value)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

async function handleGoogleSignIn() {
  isLoading.value = true
  error.value = ''

  try {
    await authStore.signInWithGoogle()
    router.push(redirect.value)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

function toggleMode() {
  isSignUp.value = !isSignUp.value
  error.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">Fluid Intimacy</h1>
        <p class="login-subtitle">
          A private, science-based intimacy education coach
        </p>
      </div>

      <BaseCard padding="lg">
        <h2 class="form-title">{{ isSignUp ? 'Create Account' : 'Welcome Back' }}</h2>

        <form class="form" @submit.prevent="handleSubmit">
          <BaseInput
            v-model="email"
            type="email"
            label="Email"
            placeholder="your@email.com"
            :disabled="isLoading"
          />

          <BaseInput
            v-model="password"
            type="password"
            label="Password"
            placeholder="Enter password"
            :disabled="isLoading"
          />

          <BaseInput
            v-if="isSignUp"
            v-model="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm password"
            :error="passwordError"
            :disabled="isLoading"
          />

          <p v-if="error" class="form-error">{{ error }}</p>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :loading="isLoading"
          >
            {{ isSignUp ? 'Create Account' : 'Sign In' }}
          </BaseButton>
        </form>

        <div class="divider">
          <span>or</span>
        </div>

        <BaseButton
          variant="outline"
          size="lg"
          full-width
          :loading="isLoading"
          @click="handleGoogleSignIn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </BaseButton>

        <p class="toggle-mode">
          {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
          <button type="button" @click="toggleMode">
            {{ isSignUp ? 'Sign In' : 'Sign Up' }}
          </button>
        </p>
      </BaseCard>

      <p class="privacy-note">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.login-title {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-3xl);
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.login-subtitle {
  color: var(--color-text-secondary);
}

.form-title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-lg);
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin: var(--space-lg) 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.toggle-mode {
  text-align: center;
  margin-top: var(--space-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.toggle-mode button {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: underline;
  cursor: pointer;
}

.privacy-note {
  text-align: center;
  margin-top: var(--space-lg);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
