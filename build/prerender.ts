import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { Plugin } from 'vite'
import { modules } from '../src/content/modules'
import { allPublicPages, SITE_NAME, SITE_URL, type PageMeta } from '../src/seo/pages'
import type { LessonContent } from '../src/types'
import { QUIZ, PRODUCTS, COUPLES_ADDON_CENTS, formatEuro } from '../src/guide/quiz'
import { SUPPORT_EMAIL } from '../src/guide/copy'

/**
 * Build step (T-0594): after `vite build`, write one static HTML file per public
 * page with that page's title, description, canonical, JSON-LD and the lesson
 * text itself inside #app. Search engines and AI crawlers read the text without
 * running JavaScript; for people, Vue replaces it on load.
 * Also writes sitemap.xml, robots.txt, llms.txt and 404.html from the same page list.
 *
 * File names (T-0636, Nov 20 2026): a page is written as dist/<path>.html, not
 * dist/<path>/index.html. Netlify serves <path>.html at /<path> directly, while a
 * folder made it answer /<path> with a redirect to /<path>/, so every sitemap
 * URL and canonical (and every in-app link) pointed at a redirect.
 */
export function prerenderPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'fluid-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    writeBundle() {
      const template = readFileSync(join(outDir, 'index.html'), 'utf8')
      const pages = allPublicPages()
      for (const page of pages) {
        const html = renderPage(template, page)
        const file = page.path === '/' ? join(outDir, 'index.html') : join(outDir, `${page.path}.html`)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html)
      }
      writeFileSync(join(outDir, '404.html'), notFoundPage(template))
      writeFileSync(join(outDir, 'sitemap.xml'), sitemap(pages))
      writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
      writeFileSync(join(outDir, 'llms.txt'), llmsTxt(pages))
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Text with line breaks (callouts use "\n" and "•" bullets) as safe HTML. */
function paragraph(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>')
}

function renderBlock(block: LessonContent): string {
  switch (block.type) {
    case 'heading':
      return `<h${block.level}>${escapeHtml(block.content)}</h${block.level}>`
    case 'text':
      return `<p>${paragraph(block.content)}</p>`
    case 'callout':
      return `<aside class="callout callout--${block.variant}"><p>${paragraph(block.content)}</p></aside>`
    case 'reflection':
      return `<p><em>Reflection: ${escapeHtml(block.prompt)}</em></p>`
    case 'quiz':
      return `<p><strong>${escapeHtml(block.question)}</strong></p><ul>${block.options.map(o => `<li>${escapeHtml(o)}</li>`).join('')}</ul>`
    case 'image':
      return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}</figure>`
    case 'interactive-svg':
      return `<ul>${block.regions.map(r => `<li><strong>${escapeHtml(r.label)}</strong>: ${escapeHtml(r.description)}</li>`).join('')}</ul>`
  }
}

function moduleList(): string {
  return `<ul>${modules
    .map(m => `<li><a href="/modules/${m.id}">${escapeHtml(m.title)}</a>: ${escapeHtml(m.description)}</li>`)
    .join('')}</ul>`
}

/** The page's own text, as plain semantic HTML. */
function pageBody(page: PageMeta): string {
  const parts = page.path.split('/').filter(Boolean)
  const nav = `<nav><a href="/">${SITE_NAME}</a> · <a href="/modules">Modules</a> · <a href="/guide">Personal guide</a></nav>`

  if (page.path === '/') {
    return `${nav}<main><h1>${escapeHtml(SITE_NAME)}</h1><p>${escapeHtml(page.description)}</p><h2>Modules</h2>${moduleList()}</main>`
  }
  if (page.path === '/guide') {
    return `${nav}<main><h1>Your personal guide</h1><p>${escapeHtml(page.description)}</p><ol>${QUIZ.map(q => `<li>${escapeHtml(q.question)}</li>`).join('')}</ol></main>`
  }
  if (page.path === '/modules') {
    return `${nav}<main><h1>Learning modules</h1><p>Progress through each module at your own pace. No rush, no pressure.</p>${moduleList()}</main>`
  }

  const module = modules.find(m => m.id === parts[1])
  if (!module) return nav

  if (parts.length === 2) {
    const lessons = module.lessons
      .map(l => `<li><a href="/modules/${module.id}/lessons/${l.id}">${escapeHtml(l.title)}</a> (${l.duration} min): ${escapeHtml(l.description)}</li>`)
      .join('')
    return `${nav}<main><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.description)}</p><ol>${lessons}</ol></main>`
  }

  const index = module.lessons.findIndex(l => l.id === parts[3])
  const lesson = module.lessons[index]
  if (!lesson) return nav
  const prev = module.lessons[index - 1]
  const next = module.lessons[index + 1]
  const pager = [
    prev ? `<a href="/modules/${module.id}/lessons/${prev.id}">Previous: ${escapeHtml(prev.title)}</a>` : '',
    next
      ? `<a href="/modules/${module.id}/lessons/${next.id}">Next: ${escapeHtml(next.title)}</a>`
      : `<a href="/modules/${module.id}">Back to ${escapeHtml(module.title)}</a>`
  ].filter(Boolean).join(' · ')

  return `${nav}<main><article><p><a href="/modules/${module.id}">${escapeHtml(module.title)}</a> · ${lesson.duration} min</p><h1>${escapeHtml(lesson.title)}</h1>${lesson.content.map(renderBlock).join('\n')}</article><p>${pager}</p></main>`
}

/** schema.org data: the course on home/overview/module pages, a learning resource on lessons. */
function jsonLd(page: PageMeta): object {
  const provider = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL }
  const parts = page.path.split('/').filter(Boolean)
  const module = modules.find(m => m.id === parts[1])

  if (module && parts.length === 4) {
    return {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: page.title.split(' | ')[0],
      description: page.description,
      url: SITE_URL + page.path,
      inLanguage: 'en',
      isAccessibleForFree: true,
      learningResourceType: 'Lesson',
      isPartOf: { '@type': 'Course', name: module.title, url: `${SITE_URL}/modules/${module.id}` },
      provider
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: module ? module.title : SITE_NAME,
    description: page.description,
    url: SITE_URL + page.path,
    inLanguage: 'en',
    isAccessibleForFree: true,
    provider
  }
}

function renderPage(template: string, page: PageMeta): string {
  const url = SITE_URL + page.path
  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    // "<" escaped so lesson text can never close the script tag early.
    `<script type="application/ld+json">${JSON.stringify(jsonLd(page)).replace(/</g, '\\u003c')}</script>`
  ].join('\n    ')

  return template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${pageBody(page)}</div>`)
}

function sitemap(pages: PageMeta[]): string {
  const urls = pages.map(p => `  <url><loc>${SITE_URL}${p.path}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/**
 * Served with status 404 for unknown URLs (netlify.toml). Before, every unknown
 * URL answered 200 with the home page, so search engines saw endless copies of it.
 * People still end up on the course: the app loads here and its router sends
 * unknown paths to the home page, as before.
 */
function notFoundPage(template: string): string {
  const nav = `<nav><a href="/">${SITE_NAME}</a> · <a href="/modules">Modules</a> · <a href="/guide">Personal guide</a></nav>`
  const body = `${nav}<main><h1>Page not found</h1><p>This page doesn't exist. <a href="/">Go to the free course</a>.</p></main>`
  return template
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `    <title>Page not found | ${escapeHtml(SITE_NAME)}</title>\n    <meta name="robots" content="noindex" />\n  </head>`)
    .replace('<div id="app"></div>', `<div id="app">${body}</div>`)
}

/**
 * llms.txt (llmstxt.org): a short plain-text summary for AI assistants and
 * answer engines, built from the same page list and prices as the site.
 */
function llmsTxt(pages: PageMeta[]): string {
  const home = pages.find(p => p.path === '/')
  const moduleSections = modules
    .map(m => {
      const lessons = m.lessons
        .map(l => `  - [${l.title}](${SITE_URL}/modules/${m.id}/lessons/${l.id}): ${l.description} (${l.duration} min)`)
        .join('\n')
      return `- [${m.title}](${SITE_URL}/modules/${m.id}): ${m.description}\n${lessons}`
    })
    .join('\n')
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return `# ${SITE_NAME}

> ${home?.description ?? ''}

${SITE_NAME} is a free online course for adults (18+) about pleasure, arousal, anatomy, communication and consent. ${modules.length} modules, ${lessonCount} short lessons, in English. No account and no sign-up: lesson progress is stored only in the visitor's own browser. It is education, not medical advice.

## Course modules

${moduleSections}

## Personal guide (optional, paid)

- [Free quiz](${SITE_URL}/guide): ${QUIZ.length} short questions; free lesson picks right away.
- Optional PDF built from the quiz answers, one-time payment (no subscription), download right after paying, no account:
  - ${PRODUCTS.guide.name}: ${formatEuro(PRODUCTS.guide.priceCents)}
  - ${PRODUCTS.deepdive.name}: ${formatEuro(PRODUCTS.deepdive.priceCents)}
  - Couples edition (partner chapters): +${formatEuro(COUPLES_ADDON_CENTS)}
- Payment by Stripe. Seller: Dizid Web Development (Netherlands). Support: ${SUPPORT_EMAIL}
`
}
