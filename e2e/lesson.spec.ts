// The open course's main path (T-0651): confirm 18+, open a module, read a
// lesson, continue to the next one, and find the first lesson ticked off on
// the module page, also after a reload (progress lives in this browser only).
import { test, expect, type Page } from '@playwright/test'

const MODULE_PATH = '/modules/anatomy'
const FIRST_LESSON = 'Introduction'
const SECOND_LESSON = 'The Anatomy of Pleasure'

async function confirmAge(page: Page) {
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Age Verification Required' })).toBeVisible()
  const enter = dialog.getByRole('button', { name: 'Enter Site' })
  await expect(enter).toBeDisabled()
  await dialog.getByLabel('I confirm that I am 18 years of age or older').check()
  await enter.click()
  await expect(dialog).toBeHidden()
}

test('a visitor confirms 18+, reads a lesson, continues, and the lesson stays ticked off', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto(MODULE_PATH)
  // The guard adds ?ageGate=true; confirming removes it again
  await expect(page).toHaveURL(/ageGate=true/)
  await confirmAge(page)
  await expect(page).toHaveURL(new RegExp(`${MODULE_PATH}$`))

  // Lesson cards are real links
  await page.getByRole('link', { name: new RegExp(FIRST_LESSON) }).click()
  await expect(page).toHaveURL(`${MODULE_PATH}/lessons/intro`)
  await expect(page.getByRole('heading', { level: 1, name: FIRST_LESSON })).toBeVisible()

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page).toHaveURL(`${MODULE_PATH}/lessons/anatomy-basics`)
  await expect(page.getByRole('heading', { level: 1, name: SECOND_LESSON })).toBeVisible()

  // Back on the module page the first lesson shows a tick instead of its number
  await page.goto(MODULE_PATH)
  const firstCard = page.locator('.lesson-card', { hasText: FIRST_LESSON })
  const secondCard = page.locator('.lesson-card', { hasText: SECOND_LESSON })
  await expect(firstCard).toHaveClass(/lesson-card--completed/)
  await expect(secondCard).not.toHaveClass(/lesson-card--completed/)

  // Saved in the browser: a reload keeps the 18+ answer and the progress
  await page.reload()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(firstCard).toHaveClass(/lesson-card--completed/)

  expect(errors).toEqual([])
})

test('a lesson link that does not exist offers the way back to the module', async ({ page }) => {
  await page.goto(`${MODULE_PATH}/lessons/no-such-lesson`)
  await confirmAge(page)
  await page.getByRole('button', { name: 'Back to Module' }).click()
  await expect(page).toHaveURL(new RegExp(`${MODULE_PATH}$`))
})
