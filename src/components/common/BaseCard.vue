<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false
})
</script>

<template>
  <div class="card" :class="[`card--padding-${padding}`, { 'card--hoverable': hoverable }]">
    <slot />
  </div>
</template>

<style scoped>
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.card--hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card--padding-none {
  padding: 0;
}

.card--padding-sm {
  padding: var(--space-md);
}

.card--padding-md {
  padding: var(--space-lg);
}

.card--padding-lg {
  padding: var(--space-xl);
}
</style>
