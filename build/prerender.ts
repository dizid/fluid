import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'
import { modules } from '../src/content/modules'
import { allPublicPages, SITE_NAME, SITE_URL, type PageMeta } from '../src/seo/pages'
import type { LessonContent } from '../src/types'
import { QUIZ } from '../src/guide/quiz'

/**
 * Build step (T-0594): after `vite build`, write one static HTML file per public
 * page (dist/<path>/index.html) with that page's title, description, canonical,
 * JSON-LD and the lesson text itself inside #app. Search engines and AI crawlers
 * read the text without running JavaScript; for people, Vue replaces it on load.
 * Also writes sitemap.xml and robots.txt from the same page list.
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
        const dir = page.path === '/' ? outDir : join(outDir, page.path)
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'index.html'), html)
      }
      writeFileSync(join(outDir, 'sitemap.xml'), sitemap(pages))
      writeFileSync(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
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
