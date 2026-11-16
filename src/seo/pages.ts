import { modules } from '../content/modules'

/**
 * One list of public pages with their title and description. Used by the app
 * (document title per route, src/seo/meta.ts) and by the build (static HTML,
 * sitemap and robots.txt, build/prerender.ts), so both always agree.
 *
 * Relative imports only: vite.config.ts bundles this file at build time.
 */

// Change these two lines when the course moves to its own domain or name.
export const SITE_URL = 'https://fluid33.netlify.app'
export const SITE_NAME = 'Fluid Intimacy'

export interface PageMeta {
  path: string
  title: string
  description: string
}

const HOME: PageMeta = {
  path: '/',
  title: `${SITE_NAME}: a free, private course on pleasure and arousal`,
  description:
    'Free, science-based lessons on anatomy, arousal, communication and consent. No account needed: your progress stays on your device.'
}

const MODULES: PageMeta = {
  path: '/modules',
  title: `All course modules | ${SITE_NAME}`,
  description: `${modules.length} free modules: ${modules.map(m => m.title).join(', ')}. Short lessons, no account, at your own pace.`
}

const GUIDE: PageMeta = {
  path: '/guide',
  title: `Free quiz: your personal intimacy guide | ${SITE_NAME}`,
  description:
    'Answer five short questions and get free lesson picks for your focus. Optional: a private PDF guide with a personal plan, built from your answers.'
}

function modulePage(moduleId: string): PageMeta | null {
  const module = modules.find(m => m.id === moduleId)
  if (!module) return null
  return {
    path: `/modules/${module.id}`,
    title: `${module.title}: ${module.lessons.length} free lessons | ${SITE_NAME}`,
    description: `${module.description} ${module.lessons.length} short lessons (${totalMinutes(module.id)} min), free and without an account.`
  }
}

function lessonPage(moduleId: string, lessonId: string): PageMeta | null {
  const module = modules.find(m => m.id === moduleId)
  const lesson = module?.lessons.find(l => l.id === lessonId)
  if (!module || !lesson) return null
  return {
    path: `/modules/${module.id}/lessons/${lesson.id}`,
    title: `${lesson.title} (${module.title}) | ${SITE_NAME}`,
    description: `${lesson.description} A ${lesson.duration}-minute lesson from the free ${module.title} module.`
  }
}

function totalMinutes(moduleId: string): number {
  const module = modules.find(m => m.id === moduleId)
  return module ? module.lessons.reduce((sum, l) => sum + l.duration, 0) : 0
}

/** Meta for any path the router knows; null for unknown paths. */
export function getPageMeta(path: string): PageMeta | null {
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/') return HOME
  if (clean === '/modules') return MODULES
  if (clean === '/guide') return GUIDE
  const parts = clean.split('/').filter(Boolean)
  if (parts[0] === 'modules' && parts.length === 2 && parts[1]) return modulePage(parts[1])
  if (parts[0] === 'modules' && parts[2] === 'lessons' && parts.length === 4 && parts[1] && parts[3]) {
    return lessonPage(parts[1], parts[3])
  }
  return null
}

/** Every public page, in reading order (home, overview, then each module and its lessons). */
export function allPublicPages(): PageMeta[] {
  const pages: PageMeta[] = [HOME, MODULES, GUIDE]
  for (const module of [...modules].sort((a, b) => a.order - b.order)) {
    const page = modulePage(module.id)
    if (page) pages.push(page)
    for (const lesson of [...module.lessons].sort((a, b) => a.order - b.order)) {
      const lp = lessonPage(module.id, lesson.id)
      if (lp) pages.push(lp)
    }
  }
  return pages
}
