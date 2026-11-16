import { getPageMeta, SITE_URL } from './pages'

/**
 * Keeps <title>, meta description, canonical and Open Graph tags in step with
 * the current route, so a shared link or a tab shows the right page.
 */
export function applyPageMeta(path: string): void {
  const meta = getPageMeta(path)
  if (!meta) return

  document.title = meta.title
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:url', SITE_URL + meta.path)

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = SITE_URL + meta.path
}

function setMeta(attr: 'name' | 'property', key: string, value: string): void {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.content = value
}
