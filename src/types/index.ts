// User types
export interface UserProfile {
  uid: string
  email: string
  createdAt: string
  isAgeVerified: boolean
  ageVerifiedAt: string | null
  isPremium: boolean
  premiumActivatedAt: string | null
  onboarding: OnboardingData | null
  partnerId: string | null
  partnerLinkCode: string | null
}

export interface OnboardingData {
  completed: boolean
  userType: 'solo' | 'couple'
  goals: string[]
  concerns: string[]
  consentAccepted: boolean
  completedAt: string | null
}

// Module types
export interface Module {
  id: string
  title: string
  description: string
  icon: string
  lessons: Lesson[]
  isFree: boolean
  order: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  content: LessonContent[]
  duration: number // minutes
  order: number
}

export type LessonContent =
  | { type: 'text'; content: string }
  | { type: 'heading'; content: string; level: 2 | 3 | 4 }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'interactive-svg'; src: string; regions: SvgRegion[] }
  | { type: 'reflection'; prompt: string; placeholder?: string }
  | { type: 'quiz'; question: string; options: string[]; correctIndex: number }
  | { type: 'callout'; content: string; variant: 'info' | 'warning' | 'tip' }

export interface SvgRegion {
  id: string
  label: string
  description: string
}

// Progress types
export interface ModuleProgress {
  started: boolean
  startedAt: string | null
  completedLessons: string[]
  completed: boolean
  completedAt: string | null
}

export interface UserProgress {
  modules: Record<string, ModuleProgress>
  lastActiveAt: string
}

// Chat types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

// Journal types
export interface JournalEntry {
  id: string
  content: string
  moduleId: string | null
  lessonId: string | null
  mood: string | null
  createdAt: string
}
