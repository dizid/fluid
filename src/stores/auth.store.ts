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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import type { UserProfile, OnboardingData } from '@/types'

// Beta tester access code
const BETA_ACCESS_CODE = 'test123'
const BETA_STORAGE_KEY = 'fluid_beta_access'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const isAgeVerified = ref(false)
  const isBetaTester = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userId = computed(() => user.value?.uid ?? null)
  const hasCompletedOnboarding = computed(() => profile.value?.onboarding?.completed ?? false)

  // Premium access: paid users OR beta testers
  const isPremium = computed(() => profile.value?.isPremium || isBetaTester.value)

  // Check for beta access code in URL and localStorage
  function checkBetaAccess() {
    // Check localStorage first
    if (localStorage.getItem(BETA_STORAGE_KEY) === 'true') {
      isBetaTester.value = true
      return
    }

    // Check URL for ?test=test123
    const urlParams = new URLSearchParams(window.location.search)
    const testCode = urlParams.get('test')

    if (testCode === BETA_ACCESS_CODE) {
      isBetaTester.value = true
      localStorage.setItem(BETA_STORAGE_KEY, 'true')
      // Clean up URL without reload
      const url = new URL(window.location.href)
      url.searchParams.delete('test')
      window.history.replaceState({}, '', url.pathname + url.search + url.hash)
    }
  }

  // Initialize auth listener
  function init() {
    // Check beta access on init
    checkBetaAccess()

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
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
      } catch (e) {
        console.error('Error in auth state change:', e)
        error.value = e instanceof Error ? e.message : 'Authentication error'
      } finally {
        isLoading.value = false
      }
    })
  }

  // Load user profile from Firestore
  async function loadProfile(uid: string) {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        // Ensure premium fields have defaults (may not exist for older users)
        profile.value = {
          ...data,
          isPremium: data.isPremium ?? false,
          premiumActivatedAt: data.premiumActivatedAt ?? null
        } as UserProfile
      }
    } catch (e) {
      console.error('Error loading profile:', e)
    }
  }

  // Create user profile in Firestore
  // Note: isPremium fields are NOT set here - only the webhook can set those
  async function createProfile(uid: string, email: string) {
    const newProfile = {
      uid,
      email,
      createdAt: new Date().toISOString(),
      isAgeVerified: false,
      ageVerifiedAt: null,
      onboarding: null,
      partnerId: null,
      partnerLinkCode: null
    }
    await setDoc(doc(db, 'users', uid), newProfile)
    // Set local profile with defaults for premium fields
    profile.value = {
      ...newProfile,
      isPremium: false,
      premiumActivatedAt: null
    }
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
      await updateDoc(doc(db, 'users', user.value.uid), {
        isAgeVerified: true,
        ageVerifiedAt: new Date().toISOString()
      })
      profile.value.isAgeVerified = true
      profile.value.ageVerifiedAt = new Date().toISOString()
    }
  }

  // Refresh profile from Firestore (useful after payment)
  async function refreshProfile() {
    if (user.value) {
      await loadProfile(user.value.uid)
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

    await updateDoc(doc(db, 'users', user.value.uid), { onboarding })
    profile.value.onboarding = onboarding
  }

  return {
    // State
    user,
    profile,
    isLoading,
    error,
    isAgeVerified,
    isBetaTester,
    // Getters
    isAuthenticated,
    userId,
    hasCompletedOnboarding,
    isPremium,
    // Actions
    init,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    verifyAge,
    saveOnboarding,
    refreshProfile
  }
}, {
  persist: {
    paths: ['isAgeVerified']
  }
})
