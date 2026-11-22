<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  /**
   * Makes the whole card a real link (router-link) to this path. Use it instead of
   * @click navigation: a link works with the keyboard (Tab + Enter), is announced as
   * a link by screen readers, opens in a new tab on long-press/middle-click, and
   * search engines can follow it after the app has rendered.
   */
  to?: string
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
  to: undefined
})
</script>

<template>
  <router-link
    v-if="to"
    :to="to"
    class="card card--link"
    :class="[`card--padding-${padding}`, { 'card--hoverable': hoverable }]"
  >
    <slot />
  </router-link>
  <div v-else class="card" :class="[`card--padding-${padding}`, { 'card--hoverable': hoverable }]">
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

/* A link card looks exactly like a plain card: block box (zero specificity, so a
   page's own display: flex/grid on the card still wins) and normal text colour
   instead of the global link colour. */
:where(.card--link) {
  display: block;
}

.card--link,
.card--link:hover {
  color: inherit;
}

.card--hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Reduced motion: keep the hover shadow, drop the lift */
@media (prefers-reduced-motion: reduce) {
  .card--hoverable:hover {
    transform: none;
  }
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
