<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { SUPPORT_EMAIL } from '@/guide/copy'

/**
 * /guide/download?session_id=cs_... (T-0594): Stripe sends buyers here after
 * paying. Fetches the PDF from /api/guide-pdf and offers it as a download.
 * While Stripe is still confirming the payment (402), it retries for ~2 minutes.
 */
const route = useRoute()
const sessionId = typeof route.query.session_id === 'string' ? route.query.session_id : ''

type State = 'loading' | 'waiting' | 'ready' | 'error'
const state = ref<State>(sessionId ? 'loading' : 'error')
const message = ref(sessionId ? '' : 'This download link is not complete. Please use the link from your payment page.')
const pdfUrl = ref('')
const FILE_NAME = 'fluid-intimacy-personal-guide.pdf'

const MAX_TRIES = 12
const RETRY_MS = 10_000
let timer: ReturnType<typeof setTimeout> | undefined

async function load(attempt = 1): Promise<void> {
  try {
    const response = await fetch(`/api/guide-pdf?session_id=${encodeURIComponent(sessionId)}`)
    if (response.ok && response.headers.get('Content-Type')?.includes('application/pdf')) {
      pdfUrl.value = URL.createObjectURL(await response.blob())
      state.value = 'ready'
      return
    }
    const data = await response.json().catch(() => null)
    const retryable = response.status === 402 || response.status >= 500
    if (retryable && attempt < MAX_TRIES) {
      state.value = 'waiting'
      timer = setTimeout(() => load(attempt + 1), RETRY_MS)
      return
    }
    message.value = data?.error ?? 'We could not prepare your PDF.'
  } catch {
    if (attempt < MAX_TRIES) {
      state.value = 'waiting'
      timer = setTimeout(() => load(attempt + 1), RETRY_MS)
      return
    }
    message.value = 'No connection. Please check your internet and reload this page.'
  }
  state.value = 'error'
}

onMounted(() => {
  if (sessionId) load()
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>

<template>
  <div class="download-page page">
    <div class="container">
      <BaseCard padding="lg" class="download-card">
        <template v-if="state === 'loading' || state === 'waiting'">
          <div class="spinner" aria-hidden="true" />
          <h1>Preparing your guide…</h1>
          <p v-if="state === 'waiting'">Your payment is still being confirmed. This page keeps trying for about two minutes.</p>
        </template>

        <template v-else-if="state === 'ready'">
          <h1>Thank you, your guide is ready</h1>
          <p>Save the PDF on your device. This page's link also downloads it again later, so you can bookmark it.</p>
          <a class="download-button" :href="pdfUrl" :download="FILE_NAME">Download your PDF</a>
          <p class="hint">On a phone, the PDF may open first; use share or save to keep it.</p>
          <router-link to="/modules" class="back-link">Go to the free course</router-link>
        </template>

        <template v-else>
          <h1>We couldn't open your download</h1>
          <p>{{ message }}</p>
          <p class="hint">
            Paid and still stuck? Email <a :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>
            with the email address you used at checkout, and we'll send your PDF.
          </p>
          <router-link to="/guide" class="back-link">Back to the guide</router-link>
        </template>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.download-card {
  text-align: center;
  max-width: 520px;
  margin: var(--space-xl) auto 0;
}

.download-card h1 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-md);
}

.download-card p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.download-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: #fff;
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  margin-bottom: var(--space-md);
}

.download-button:hover {
  background-color: var(--color-primary-dark);
}

.hint {
  font-size: var(--font-size-sm);
}

.hint a,
.back-link {
  color: var(--color-primary-dark);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--space-lg);
  border: 3px solid rgba(107, 142, 123, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
