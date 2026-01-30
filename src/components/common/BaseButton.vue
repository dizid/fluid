<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})
</script>

<template>
  <button
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--full-width': fullWidth, 'btn--loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" />
    <span class="btn__content" :class="{ 'btn__content--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.btn--primary {
  background-color: var(--color-primary);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn--secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn--secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-dark);
}

.btn--outline {
  background-color: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.btn--outline:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.btn--ghost:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-primary);
}

/* Sizes */
.btn--sm {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-sm);
}

.btn--md {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-base);
}

.btn--lg {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-lg);
}

.btn--full-width {
  width: 100%;
}

/* Loading spinner */
.btn__spinner {
  position: absolute;
  width: 1.25em;
  height: 1.25em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.btn__content--hidden {
  visibility: hidden;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
