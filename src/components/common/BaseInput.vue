<script setup lang="ts">
interface Props {
  type?: 'text' | 'email' | 'password'
  label?: string
  error?: string
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false
})

const model = defineModel<string>()
</script>

<template>
  <div class="input-group" :class="{ 'input-group--error': error }">
    <label v-if="label" class="input-group__label">{{ label }}</label>
    <input
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-group__input"
    />
    <span v-if="error" class="input-group__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.input-group__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.input-group__input {
  padding: var(--space-sm) var(--space-md);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  background-color: var(--color-surface);
}

.input-group__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(107, 142, 123, 0.2);
}

.input-group__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-group--error .input-group__input {
  border-color: var(--color-error);
}

.input-group--error .input-group__input:focus {
  box-shadow: 0 0 0 3px rgba(214, 48, 49, 0.2);
}

.input-group__error {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}
</style>
