import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from './auth.store'
import { useProgressStore } from './progress.store'
import type { ChatMessage } from '@/types'

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const isSending = ref(false)

  // Actions
  async function loadMessages() {
    const authStore = useAuthStore()
    if (!authStore.userId) return

    isLoading.value = true
    try {
      const messagesRef = collection(db, 'conversations', authStore.userId, 'messages')
      const q = query(messagesRef, orderBy('createdAt', 'asc'))
      const snapshot = await getDocs(q)
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[]
    } catch (e) {
      console.error('Error loading messages:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function sendMessage(content: string) {
    const authStore = useAuthStore()
    if (!authStore.userId || isSending.value) return

    isSending.value = true

    // Add user message locally
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    }
    messages.value.push(userMessage)

    try {
      // Save user message to Firestore
      const messagesRef = collection(db, 'conversations', authStore.userId, 'messages')
      const userDocRef = await addDoc(messagesRef, {
        role: 'user',
        content,
        createdAt: Timestamp.now()
      })
      userMessage.id = userDocRef.id

      // Gather user context for personalized AI responses
      const progressStore = useProgressStore()
      const userContext: Record<string, unknown> = {}

      if (authStore.profile?.onboarding) {
        userContext.userType = authStore.profile.onboarding.userType
        userContext.goals = authStore.profile.onboarding.goals
      }

      const completedModules = Object.entries(progressStore.progress.modules)
        .filter(([, mod]) => mod.completed)
        .map(([id]) => id)

      if (completedModules.length > 0) {
        userContext.completedModules = completedModules
      }

      userContext.overallProgress = progressStore.overallProgress

      // Call AI coach API
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.value.map(m => ({
            role: m.role,
            content: m.content
          })),
          userId: authStore.userId,
          userContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        createdAt: new Date().toISOString()
      }
      messages.value.push(assistantMessage)

      // Save assistant message to Firestore
      const assistantDocRef = await addDoc(messagesRef, {
        role: 'assistant',
        content: data.message,
        createdAt: Timestamp.now()
      })
      assistantMessage.id = assistantDocRef.id

    } catch (e) {
      console.error('Error sending message:', e)
      // Remove the optimistic user message on error
      messages.value = messages.value.filter(m => m.id !== userMessage.id)
      throw e
    } finally {
      isSending.value = false
    }
  }

  function clearMessages() {
    messages.value = []
  }

  return {
    // State
    messages,
    isLoading,
    isSending,
    // Actions
    loadMessages,
    sendMessage,
    clearMessages
  }
})
