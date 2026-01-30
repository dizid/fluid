import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import type { UserProfile, OnboardingData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isAgeVerified = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.uid ?? null)
  const hasCompletedOnboarding = computed(() => profile.value?.onboarding?.completed ?? false)

  // Initialize auth listener
  function init() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid)
        // Restore age verification from profile
        if (profile.value?.isAgeVerified) {
          isAgeVerified.value = true
        }
      } else {
        profile.value = null
      }
      isLoading.value = false
    })
  }

  // Load user profile from Firestore
  async function loadProfile(uid: string) {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        profile.value = docSnap.data() as UserProfile
      }
    } catch (e) {
      console.error('Error loading profile:', e)
    }
  }

  // Create user profile in Firestore
  async function createProfile(uid: string, email: string) {
    const newProfile: UserProfile = {
      uid,
      email,
      createdAt: new Date().toISOString(),
      isAgeVerified: false,
      ageVerifiedAt: null,
      isPremium: false,
      premiumActivatedAt: null,
      onboarding: null,
      partnerId: null,
      partnerLinkCode: null
    }
    await setDoc(doc(db, 'users', uid), newProfile)
    profile.value = newProfile
  }

  // Sign up with email/password
  async function signUp(email: string, password: string) {
    error.value = null
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
      await createProfile(newUser.uid, email)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Sign up failed'
      throw e
    }
  }

  // Sign in with email/password
  async function signIn(email: string, password: string) {
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Sign in failed'
      throw e
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      const { user: newUser } = await signInWithPopup(auth, provider)
      // Check if profile exists, create if not
      const docRef = doc(db, 'users', newUser.uid)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        await createProfile(newUser.uid, newUser.email ?? '')
      }
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Google sign in failed'
      throw e
    }
  }

  // Sign out
  async function signOut() {
    await firebaseSignOut(auth)
    user.value = null
    profile.value = null
    isAgeVerified.value = false
  }

  // Verify age (18+)
  async function verifyAge() {
    isAgeVerified.value = true
    if (user.value && profile.value) {
      await setDoc(doc(db, 'users', user.value.uid), {
        ...profile.value,
        isAgeVerified: true,
        ageVerifiedAt: new Date().toISOString()
      })
      profile.value.isAgeVerified = true
      profile.value.ageVerifiedAt = new Date().toISOString()
    }
  }

  // Save onboarding data
  async function saveOnboarding(data: Omit<OnboardingData, 'completed' | 'completedAt'>) {
    if (!user.value || !profile.value) return

    const onboarding: OnboardingData = {
      ...data,
      completed: true,
      completedAt: new Date().toISOString()
    }

    await setDoc(doc(db, 'users', user.value.uid), {
      ...profile.value,
      onboarding
    })
    profile.value.onboarding = onboarding
  }

  return {
    // State
    user,
    profile,
    isLoading,
    error,
    isAgeVerified,
    // Getters
    isAuthenticated,
    userId,
    hasCompletedOnboarding,
    // Actions
    init,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    verifyAge,
    saveOnboarding
  }
}, {
  persist: {
    paths: ['isAgeVerified']
  }
})
