<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AgeGate from '@/components/auth/AgeGate.vue'
import { useAuthStore } from '@/stores/auth.store'

const route = useRoute()
const authStore = useAuthStore()

const showAgeGate = computed(() => {
  return route.query.ageGate === 'true' && !authStore.isAgeVerified
})

const showHeader = computed(() => {
  return authStore.isAuthenticated && route.name !== 'login'
})

// Remove ageGate query param after verification
watch(() => authStore.isAgeVerified, (verified) => {
  if (verified && route.query.ageGate) {
    const { ageGate, ...rest } = route.query
    history.replaceState({}, '', route.path + (Object.keys(rest).length ? '?' + new URLSearchParams(rest as Record<string, string>).toString() : ''))
  }
})
</script>

<template>
  <div class="app">
    <AppHeader v-if="showHeader" />
    <main class="app__main">
      <RouterView />
    </main>
    <AgeGate v-if="showAgeGate" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
