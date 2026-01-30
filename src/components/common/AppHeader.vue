<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)

async function handleSignOut() {
  await authStore.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="header">
    <div class="header__container">
      <router-link to="/" class="header__logo">
        <span class="header__logo-text">Fluid Intimacy</span>
      </router-link>

      <nav v-if="isLoggedIn" class="header__nav">
        <router-link to="/modules" class="header__link">Modules</router-link>
        <router-link to="/coach" class="header__link">AI Coach</router-link>
        <router-link to="/profile" class="header__link">Profile</router-link>
        <button class="header__link header__link--button" @click="handleSignOut">
          Sign Out
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--color-surface);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: var(--space-md) var(--space-lg);
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header__logo {
  text-decoration: none;
}

.header__logo-text {
  font-family: var(--font-family-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.header__link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.header__link:hover {
  color: var(--color-primary);
}

.header__link.router-link-active {
  color: var(--color-primary);
}

.header__link--button {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

@media (max-width: 640px) {
  .header__nav {
    gap: var(--space-md);
  }

  .header__link {
    font-size: var(--font-size-xs);
  }
}
</style>
