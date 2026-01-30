<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(0)
const isSubmitting = ref(false)

// Form data
const userType = ref<'solo' | 'couple' | null>(null)
const selectedGoals = ref<string[]>([])
const selectedConcerns = ref<string[]>([])
const consentAccepted = ref(false)

const goals = [
  { id: 'curiosity', label: 'Curiosity & Learning', description: 'Understanding anatomy and pleasure' },
  { id: 'communication', label: 'Better Communication', description: 'Talking openly with my partner' },
  { id: 'exploration', label: 'Guided Exploration', description: 'Safe, structured discovery' },
  { id: 'connection', label: 'Deeper Connection', description: 'Building intimacy and trust' }
]

const concerns = [
  { id: 'pressure', label: 'Performance Pressure', description: "I'm worried about expectations" },
  { id: 'confusion', label: 'Confusion', description: "I don't know where to start" },
  { id: 'communication', label: 'Communication', description: 'Difficulty talking about this' },
  { id: 'anatomy', label: 'Anatomy', description: 'Understanding how bodies work' },
  { id: 'none', label: 'No Concerns', description: "I'm ready to explore" }
]

const steps = ['User Type', 'Goals', 'Concerns', 'Consent']

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0: return userType.value !== null
    case 1: return selectedGoals.value.length > 0
    case 2: return selectedConcerns.value.length > 0
    case 3: return consentAccepted.value
    default: return false
  }
})

function toggleGoal(id: string) {
  const index = selectedGoals.value.indexOf(id)
  if (index === -1) {
    selectedGoals.value.push(id)
  } else {
    selectedGoals.value.splice(index, 1)
  }
}

function toggleConcern(id: string) {
  if (id === 'none') {
    selectedConcerns.value = ['none']
  } else {
    const noneIndex = selectedConcerns.value.indexOf('none')
    if (noneIndex !== -1) {
      selectedConcerns.value.splice(noneIndex, 1)
    }
    const index = selectedConcerns.value.indexOf(id)
    if (index === -1) {
      selectedConcerns.value.push(id)
    } else {
      selectedConcerns.value.splice(index, 1)
    }
  }
}

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

async function handleSubmit() {
  if (!canProceed.value || !userType.value) return

  isSubmitting.value = true
  try {
    await authStore.saveOnboarding({
      userType: userType.value,
      goals: selectedGoals.value,
      concerns: selectedConcerns.value,
      consentAccepted: true
    })
    router.push('/modules')
  } catch (e) {
    console.error('Error saving onboarding:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <div class="onboarding-header">
        <h1>Welcome to Fluid Intimacy</h1>
        <p>Let's personalize your experience</p>
      </div>

      <!-- Progress -->
      <div class="progress">
        <div
          v-for="(step, index) in steps"
          :key="step"
          class="progress__step"
          :class="{
            'progress__step--active': index === currentStep,
            'progress__step--completed': index < currentStep
          }"
        >
          <span class="progress__number">{{ index + 1 }}</span>
          <span class="progress__label">{{ step }}</span>
        </div>
      </div>

      <BaseCard padding="lg">
        <!-- Step 1: User Type -->
        <div v-if="currentStep === 0" class="step">
          <h2 class="step__title">How will you be using this app?</h2>
          <p class="step__description">This helps us tailor the content for you.</p>

          <div class="options options--large">
            <button
              class="option option--large"
              :class="{ 'option--selected': userType === 'solo' }"
              @click="userType = 'solo'"
            >
              <span class="option__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </span>
              <span class="option__label">Solo</span>
              <span class="option__description">Learning and exploring on my own</span>
            </button>

            <button
              class="option option--large"
              :class="{ 'option--selected': userType === 'couple' }"
              @click="userType = 'couple'"
            >
              <span class="option__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="9" cy="7" r="3" />
                  <circle cx="15" cy="7" r="3" />
                  <path d="M3 21v-2a4 4 0 0 1 4-4h2" />
                  <path d="M15 15a4 4 0 0 1 4 4v2" />
                  <path d="M12 12v9" />
                </svg>
              </span>
              <span class="option__label">With Partner</span>
              <span class="option__description">Exploring together as a couple</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Goals -->
        <div v-if="currentStep === 1" class="step">
          <h2 class="step__title">What brings you here?</h2>
          <p class="step__description">Select all that apply.</p>

          <div class="options">
            <button
              v-for="goal in goals"
              :key="goal.id"
              class="option"
              :class="{ 'option--selected': selectedGoals.includes(goal.id) }"
              @click="toggleGoal(goal.id)"
            >
              <span class="option__label">{{ goal.label }}</span>
              <span class="option__description">{{ goal.description }}</span>
            </button>
          </div>
        </div>

        <!-- Step 3: Concerns -->
        <div v-if="currentStep === 2" class="step">
          <h2 class="step__title">Any concerns we should know about?</h2>
          <p class="step__description">This helps us address common barriers. Select all that apply.</p>

          <div class="options">
            <button
              v-for="concern in concerns"
              :key="concern.id"
              class="option"
              :class="{ 'option--selected': selectedConcerns.includes(concern.id) }"
              @click="toggleConcern(concern.id)"
            >
              <span class="option__label">{{ concern.label }}</span>
              <span class="option__description">{{ concern.description }}</span>
            </button>
          </div>
        </div>

        <!-- Step 4: Consent -->
        <div v-if="currentStep === 3" class="step">
          <h2 class="step__title">Before we begin</h2>

          <div class="consent-box">
            <h3>Important Information</h3>
            <ul>
              <li>This app provides educational content about sexual wellness and anatomy.</li>
              <li>Everyone's body is different. What works for some may not work for others.</li>
              <li>There are no guarantees of specific outcomes. Pleasure and exploration should never feel pressured.</li>
              <li>If you experience pain or have medical concerns, please consult a healthcare professional.</li>
              <li>All content is designed to be respectful, inclusive, and evidence-based.</li>
            </ul>
          </div>

          <label class="consent-checkbox">
            <input v-model="consentAccepted" type="checkbox" />
            <span>I understand and accept these terms</span>
          </label>
        </div>

        <!-- Navigation -->
        <div class="step__actions">
          <BaseButton
            v-if="currentStep > 0"
            variant="ghost"
            @click="prevStep"
          >
            Back
          </BaseButton>
          <div v-else />

          <BaseButton
            v-if="currentStep < 3"
            variant="primary"
            :disabled="!canProceed"
            @click="nextStep"
          >
            Continue
          </BaseButton>
          <BaseButton
            v-else
            variant="primary"
            :disabled="!canProceed"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            Start Learning
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.onboarding-container {
  width: 100%;
  max-width: 600px;
}

.onboarding-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.onboarding-header h1 {
  font-size: var(--font-size-2xl);
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.onboarding-header p {
  color: var(--color-text-secondary);
}

/* Progress */
.progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.progress__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  opacity: 0.5;
  transition: opacity var(--transition-fast);
}

.progress__step--active,
.progress__step--completed {
  opacity: 1;
}

.progress__number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast);
}

.progress__step--active .progress__number {
  background-color: var(--color-primary);
}

.progress__step--completed .progress__number {
  background-color: var(--color-success);
}

.progress__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Step content */
.step__title {
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-sm);
  text-align: center;
}

.step__description {
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: var(--space-xl);
}

/* Options */
.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.options--large {
  flex-direction: row;
}

.option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  padding: var(--space-md);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.option:hover {
  border-color: var(--color-primary-light);
}

.option--selected {
  border-color: var(--color-primary);
  background-color: rgba(107, 142, 123, 0.1);
}

.option--large {
  flex: 1;
  align-items: center;
  text-align: center;
  padding: var(--space-xl);
}

.option__icon {
  color: var(--color-primary);
  margin-bottom: var(--space-sm);
}

.option__label {
  font-weight: var(--font-weight-semibold);
}

.option__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

/* Consent */
.consent-box {
  background-color: rgba(107, 142, 123, 0.1);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.consent-box h3 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-md);
}

.consent-box ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.consent-box li {
  position: relative;
  padding-left: var(--space-lg);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.consent-box li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--color-primary);
}

.consent-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
}

.consent-checkbox input {
  width: 20px;
  height: 20px;
  accent-color: var(--color-primary);
}

.consent-checkbox span {
  font-weight: var(--font-weight-medium);
}

/* Actions */
.step__actions {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xl);
}

@media (max-width: 640px) {
  .options--large {
    flex-direction: column;
  }

  .progress__label {
    display: none;
  }
}
</style>
