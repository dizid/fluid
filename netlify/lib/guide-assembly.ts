import { QUIZ, LESSONS_BY_GOAL, optionLabel, type ProductKey, type QuizAnswers } from "../../src/guide/quiz.ts"
import { modules } from "../../src/content/modules/index.ts"
import { SITE_URL } from "../../src/seo/pages.ts"
import { GUIDE_TEXT } from "./guide-text.ts"
import type { Chapter, GuideDocument } from "./pdf-builder.ts"

/**
 * Picks the text blocks that match a buyer's quiz answers and puts them in
 * reading order (T-0594). Pure function: same answers, same PDF.
 */

function block(key: string): string {
  const text = GUIDE_TEXT[key]
  if (!text) throw new Error(`guide text block missing: ${key}`)
  return text
}

function lessonList(goal: string): string {
  const items = (LESSONS_BY_GOAL[goal] ?? []).map(([moduleId, lessonId]) => {
    const module = modules.find(m => m.id === moduleId)
    const lesson = module?.lessons.find(l => l.id === lessonId)
    if (!module || !lesson) return null
    return `- ${lesson.title} (${module.title}, ${lesson.duration} min): ${SITE_URL}/modules/${module.id}/lessons/${lesson.id}`
  })
  return items.filter(Boolean).join("\n")
}

export function assembleGuide(product: ProductKey, couples: boolean, answers: QuizAnswers): GuideDocument {
  const chapters: Chapter[] = [
    { title: "Before you start", body: block(`for-${answers.for}`) },
    {
      title: `Your focus: ${optionLabel("goal", answers.goal).toLowerCase()}`,
      body: `${block(`goal-${answers.goal}`)}\n\n### Free lessons to pair with this\n\n${lessonList(answers.goal)}`
    },
    { title: "At your level", body: block(`exp-${answers.exp}`) },
    { title: "What gets in the way", body: block(`barrier-${answers.barrier}`) },
    { title: "Your 4-week rhythm", body: block(`pace-${answers.pace}`) }
  ]

  if (couples) {
    chapters.push(
      { title: "For the two of you", body: block("couple-intro") },
      { title: "Supporting each other in your focus", body: block(`couple-goal-${answers.goal}`) },
      { title: "Talking about it", body: block("couple-conversation") }
    )
  }

  if (product === "deepdive") {
    chapters.push(
      { title: "Deep dive: the anatomy of arousal", body: block("deep-anatomy") },
      { title: "Deep dive: relaxation before arousal", body: block("deep-nervous-system") },
      { title: "Deep dive: the arousal curve", body: block("deep-arousal-curve") },
      { title: "Deep dive: your pelvic floor", body: block("deep-pelvic-floor") },
      { title: "Deep dive: about fluids", body: block("deep-fluids") },
      { title: "Deep dive: after a practice", body: block("deep-aftercare") }
    )
    const days = Array.from({ length: 30 }, (_, i) => {
      const key = `day-${String(i + 1).padStart(2, "0")}`
      return `### Day ${i + 1}\n${block(key)}`
    })
    chapters.push({
      title: "Your 30-day practice plan",
      body: `Every day is optional. Skip, repeat or rest whenever you like.\n\n${days.join("\n\n")}`
    })
    if (couples) chapters.push({ title: "The 30-day plan as a couple", body: block("couple-plan-notes") })
  }

  chapters.push(
    { title: "Safety checklist", body: block("safety") },
    { title: "When to get support", body: block("professional") },
    { title: "Go at your own pace", body: `${block("closing")}\n\n${block("disclaimer")}` }
  )

  const edition = [product === "deepdive" ? "Personal guide + deep dive + 30-day plan" : "Personal guide", couples ? "couples edition" : ""]
    .filter(Boolean)
    .join(", ")

  return {
    title: "Your personal intimacy guide",
    subtitle: edition,
    intro: [
      "Made from your answers:",
      ...QUIZ.map(q => `${q.question} ${optionLabel(q.key, answers[q.key])}`),
      "",
      `The free course: ${SITE_URL}`
    ],
    chapters,
    footer: "Fluid Intimacy · education, not medical advice"
  }
}
