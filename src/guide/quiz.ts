/**
 * The personal-guide quiz and the paid products (T-0594). Shared by the quiz page
 * and the Netlify functions (checkout + PDF), so answers and prices can't drift.
 * Relative imports only: the functions bundle this file too.
 */

export type QuestionKey = 'for' | 'goal' | 'exp' | 'barrier' | 'pace'

export interface QuizOption {
  value: string
  label: string
}

export interface QuizQuestion {
  key: QuestionKey
  question: string
  options: QuizOption[]
}

export const QUIZ: QuizQuestion[] = [
  {
    key: 'for',
    question: 'Who is this guide for?',
    options: [
      { value: 'solo', label: 'Just me, exploring my own body' },
      { value: 'partner', label: 'Me, and I have a partner I may share it with' },
      { value: 'together', label: 'The two of us, reading together' }
    ]
  },
  {
    key: 'goal',
    question: 'What would you most like to change?',
    options: [
      { value: 'understand', label: 'Understand the body and what is possible' },
      { value: 'relax', label: 'Feel less tense or self-conscious' },
      { value: 'arousal', label: 'Build arousal more easily and slow down' },
      { value: 'talk', label: 'Talk more openly about what feels good' },
      { value: 'explore', label: 'Explore female ejaculation or squirting safely' }
    ]
  },
  {
    key: 'exp',
    question: 'How familiar is this topic for you?',
    options: [
      { value: 'new', label: 'Completely new' },
      { value: 'some', label: 'I have read or tried a little' },
      { value: 'experienced', label: 'Fairly experienced, I want to go deeper' }
    ]
  },
  {
    key: 'barrier',
    question: 'What gets in the way most often?',
    options: [
      { value: 'pressure', label: 'Pressure to perform or reach a goal' },
      { value: 'body', label: 'Feeling self-conscious about my body or fluids' },
      { value: 'time', label: 'Not enough time or privacy' },
      { value: 'words', label: 'Not knowing how to put it into words' },
      { value: 'discomfort', label: 'Discomfort, or worry that it might hurt' }
    ]
  },
  {
    key: 'pace',
    question: 'How much time can you give it?',
    options: [
      { value: 'short', label: '10 minutes, a few times a week' },
      { value: 'medium', label: '20 to 30 minutes, a few times a week' },
      { value: 'long', label: 'One unhurried hour a week' }
    ]
  }
]

export type QuizAnswers = Record<QuestionKey, string>

/** True only when every question has one of its own option values. */
export function isValidAnswers(input: unknown): input is QuizAnswers {
  if (!input || typeof input !== 'object') return false
  const record = input as Record<string, unknown>
  return QUIZ.every(q => typeof record[q.key] === 'string' && q.options.some(o => o.value === record[q.key]))
}

export function optionLabel(key: QuestionKey, value: string): string {
  return QUIZ.find(q => q.key === key)?.options.find(o => o.value === value)?.label ?? value
}

// Free course lessons that pair with each goal (module id / lesson id).
export const LESSONS_BY_GOAL: Record<string, Array<[string, string]>> = {
  understand: [['anatomy', 'intro'], ['anatomy', 'anatomy-basics'], ['anatomy', 'science']],
  relax: [['mindset', 'relaxation'], ['mindset', 'breathwork'], ['preparation', 'pelvic-floor']],
  arousal: [['mindset', 'arousal'], ['mindset', 'relaxation'], ['mindset', 'breathwork']],
  talk: [['communication', 'opening-up'], ['communication', 'boundaries'], ['communication', 'feedback']],
  explore: [['anatomy', 'science'], ['preparation', 'physical-prep'], ['preparation', 'hygiene']]
}

// ---- Paid products (prices in euro cents; one place to change them) ----

export type ProductKey = 'guide' | 'deepdive'

export interface Product {
  key: ProductKey
  name: string
  priceCents: number
}

export const PRODUCTS: Record<ProductKey, Product> = {
  guide: { key: 'guide', name: 'Your personal guide (PDF)', priceCents: 1200 },
  deepdive: { key: 'deepdive', name: 'Personal guide + deep dive + 30-day plan (PDF)', priceCents: 1900 }
}

export const COUPLES_ADDON_CENTS = 500

export function totalCents(product: ProductKey, couples: boolean): number {
  return PRODUCTS[product].priceCents + (couples ? COUPLES_ADDON_CENTS : 0)
}

export function formatEuro(cents: number): string {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

export function isProductKey(value: unknown): value is ProductKey {
  return value === 'guide' || value === 'deepdive'
}
