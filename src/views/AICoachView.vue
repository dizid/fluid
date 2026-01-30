<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useChatStore } from '@/stores/chat.store'

const chatStore = useChatStore()
const inputMessage = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const error = ref('')

const messages = computed(() => chatStore.messages)
const isLoading = computed(() => chatStore.isLoading)
const isSending = computed(() => chatStore.isSending)

const suggestedQuestions = [
  "What is the urethral sponge?",
  "How can I reduce performance anxiety?",
  "How do I talk to my partner about trying new things?",
  "Why is relaxation important for pleasure?",
  "What's the difference between female ejaculation and squirting?"
]

onMounted(async () => {
  await chatStore.loadMessages()
  scrollToBottom()
})

async function sendMessage() {
  if (!inputMessage.value.trim() || isSending.value) return

  const message = inputMessage.value.trim()
  inputMessage.value = ''
  error.value = ''

  try {
    await chatStore.sendMessage(message)
    await nextTick()
    scrollToBottom()
  } catch (e) {
    error.value = 'Failed to send message. Please try again.'
  }
}

function sendSuggestedQuestion(question: string) {
  inputMessage.value = question
  sendMessage()
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="coach-page page">
    <div class="coach-container">
      <header class="coach-header">
        <h1>AI Coach</h1>
        <p>Ask questions about anatomy, communication, or anything covered in the modules.</p>
      </header>

      <BaseCard padding="none" class="chat-card">
        <!-- Messages -->
        <div ref="chatContainer" class="chat-messages">
          <!-- Welcome message if no messages -->
          <div v-if="messages.length === 0 && !isLoading" class="chat-welcome">
            <div class="welcome-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h2>Welcome to your AI Coach</h2>
            <p>I'm here to answer your questions about sexual wellness, anatomy, and communication. Ask me anything from the modules, or try one of these questions:</p>

            <div class="suggested-questions">
              <button
                v-for="question in suggestedQuestions"
                :key="question"
                class="suggested-question"
                @click="sendSuggestedQuestion(question)"
              >
                {{ question }}
              </button>
            </div>
          </div>

          <!-- Chat messages -->
          <div
            v-for="message in messages"
            :key="message.id"
            class="chat-message"
            :class="`chat-message--${message.role}`"
          >
            <div class="message-avatar">
              <svg v-if="message.role === 'assistant'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
              </svg>
            </div>
            <div class="message-content">
              <p>{{ message.content }}</p>
            </div>
          </div>

          <!-- Loading indicator -->
          <div v-if="isSending" class="chat-message chat-message--assistant">
            <div class="message-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <div class="message-content message-content--loading">
              <span class="typing-dot" />
              <span class="typing-dot" />
              <span class="typing-dot" />
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-container">
          <p v-if="error" class="chat-error">{{ error }}</p>
          <div class="chat-input-wrapper">
            <textarea
              v-model="inputMessage"
              class="chat-input"
              placeholder="Ask a question..."
              rows="1"
              :disabled="isSending"
              @keydown="handleKeydown"
            />
            <BaseButton
              variant="primary"
              size="sm"
              :disabled="!inputMessage.trim() || isSending"
              :loading="isSending"
              @click="sendMessage"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </BaseButton>
          </div>
          <p class="chat-disclaimer">
            This AI provides educational information only, not medical advice.
          </p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.coach-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

.coach-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-lg);
  overflow: hidden;
}

.coach-header {
  text-align: center;
  margin-bottom: var(--space-lg);
  flex-shrink: 0;
}

.coach-header h1 {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--space-xs);
}

.coach-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* Welcome state */
.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-2xl);
}

.welcome-icon {
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
}

.chat-welcome h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
}

.chat-welcome > p {
  color: var(--color-text-secondary);
  max-width: 400px;
  margin-bottom: var(--space-xl);
}

.suggested-questions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: center;
}

.suggested-question {
  padding: var(--space-sm) var(--space-md);
  background-color: rgba(107, 142, 123, 0.1);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.suggested-question:hover {
  background-color: var(--color-primary);
  color: white;
}

/* Message bubbles */
.chat-message {
  display: flex;
  gap: var(--space-sm);
  max-width: 85%;
}

.chat-message--user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.chat-message--assistant {
  align-self: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-message--user .message-avatar {
  background-color: var(--color-secondary);
  color: white;
}

.chat-message--assistant .message-avatar {
  background-color: var(--color-primary);
  color: white;
}

.message-content {
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  line-height: var(--line-height-relaxed);
}

.chat-message--user .message-content {
  background-color: var(--color-primary);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

.chat-message--assistant .message-content {
  background-color: rgba(0, 0, 0, 0.05);
  border-bottom-left-radius: var(--radius-sm);
}

.message-content p {
  margin: 0;
  white-space: pre-wrap;
}

/* Typing indicator */
.message-content--loading {
  display: flex;
  gap: 4px;
  padding: var(--space-md) var(--space-lg);
}

.typing-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-text-muted);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Input */
.chat-input-container {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: var(--color-surface);
}

.chat-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.chat-input-wrapper {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: var(--font-size-base);
  resize: none;
  max-height: 120px;
  transition: border-color var(--transition-fast);
}

.chat-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.chat-disclaimer {
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-sm);
}
</style>
