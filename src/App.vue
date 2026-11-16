<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AgeGate from '@/components/auth/AgeGate.vue'
import { useVisitorStore } from '@/stores/visitor.store'

const route = useRoute()
const visitorStore = useVisitorStore()

const showAgeGate = computed(() => {
  return route.query.ageGate === 'true' && !visitorStore.isAgeVerified
})


// Remove ageGate query param after verification
watch(() => visitorStore.isAgeVerified, (verified) => {
  if (verified && route.query.ageGate) {
    const { ageGate, ...rest } = route.query
    history.replaceState({}, '', route.path + (Object.keys(rest).length ? '?' + new URLSearchParams(rest as Record<string, string>).toString() : ''))
  }
})
</script>

<template>
  <div class="app">
    <AppHeader />
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
