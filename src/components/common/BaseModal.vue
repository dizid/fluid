<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  show: boolean
  title?: string
  /** Name read out by screen readers when the modal has no visible title. */
  label?: string
  closable?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  size: 'md'
})

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  if (props.closable) {
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable) {
    emit('close')
  }
}

/**
 * Keyboard + screen readers (T-0636): while the modal is open, the page behind it can't be
 * reached. The app root (#app) is made inert (the modal is teleported to <body>, outside it)
 * and focus starts on the modal itself, so the first Tab lands on the modal's first control.
 * Before, Tab went through every link of the hidden page first (the 18+ gate: 4-6 presses,
 * incl. quiz answers behind it) and fell back into that page after the last button.
 */
const modalRef = ref<HTMLElement | null>(null)

function setBackgroundInert(on: boolean) {
  const appRoot = document.getElementById('app')
  if (appRoot) appRoot.inert = on
}

async function lockToModal(open: boolean) {
  setBackgroundInert(open)
  if (!open) return
  await nextTick()
  modalRef.value?.focus({ preventScroll: true })
}

watch(() => props.show, lockToModal)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
  if (props.show) lockToModal(true)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  setBackgroundInert(false)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="handleClose">
        <div ref="modalRef" class="modal" :class="`modal--${size}`" role="dialog" aria-modal="true" :aria-label="title || label" tabindex="-1">
          <header v-if="title || closable" class="modal__header">
            <h2 v-if="title" class="modal__title">{{ title }}</h2>
            <button
              v-if="closable"
              class="modal__close"
              @click="handleClose"
              aria-label="Close modal"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>
          <div class="modal__content">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  z-index: var(--z-modal);
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow: auto;
  width: 100%;
}

/* The modal box only takes focus so Tab starts inside it; its controls show the focus ring */
.modal:focus {
  outline: none;
}

.modal--sm {
  max-width: 400px;
}

.modal--md {
  max-width: 500px;
}

.modal--lg {
  max-width: 700px;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin: 0;
}

.modal__close {
  padding: var(--space-xs);
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.modal__close:hover {
  color: var(--color-text-primary);
}

.modal__content {
  padding: var(--space-lg);
}

.modal__footer {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  padding: var(--space-lg);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--transition-normal), opacity var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
