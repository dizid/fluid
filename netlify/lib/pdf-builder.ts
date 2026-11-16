import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"

/**
 * Small A4 layout engine for the paid guides (T-0594): title page, chapters with
 * headings, paragraphs, bullet lists, automatic line wrap and page breaks, and a
 * footer with page numbers. Standard PDF fonts only (no font files to ship), so
 * text is first mapped to characters those fonts can draw (WinAnsi).
 */

export interface Chapter {
  title: string
  /** Light Markdown: blank-line paragraphs, "- " bullets, **bold** is shown plain. */
  body: string
}

export interface GuideDocument {
  title: string
  subtitle: string
  /** Lines under the subtitle on the title page (e.g. the buyer's answers). */
  intro: string[]
  chapters: Chapter[]
  footer: string
}

const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 60
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const BODY_SIZE = 11
const LINE_HEIGHT = 16.5

const SAGE = rgb(0x6b / 255, 0x8e / 255, 0x7b / 255)
const INK = rgb(0x2d / 255, 0x34 / 255, 0x36 / 255)
const MUTED = rgb(0x63 / 255, 0x6e / 255, 0x72 / 255)
const CREAM = rgb(0xfd / 255, 0xf8 / 255, 0xf3 / 255)

// Characters the standard fonts can draw beyond Latin-1 (Windows-1252 extras).
const WIN_ANSI_EXTRAS = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ")
const REPLACEMENTS: Record<string, string> = {
  "→": "->", "←": "<-", "≥": ">=", "≤": "<=", "×": "x", "‑": "-", "‐": "-", "−": "-",
  " ": " ", " ": " ", " ": " ", "​": "", "✓": "-", "✔": "-", "★": "*"
}

/** Map text to what Helvetica/Times can encode; anything else is dropped. */
export function toWinAnsi(text: string): string {
  let out = ""
  for (const ch of text.normalize("NFC")) {
    const code = ch.codePointAt(0) ?? 0
    if (REPLACEMENTS[ch] !== undefined) out += REPLACEMENTS[ch]
    else if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || ch === "\n" || WIN_ANSI_EXTRAS.has(ch)) out += ch
  }
  return out
}

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) <= width || !line) {
      line = candidate
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

class Writer {
  private page!: PDFPage
  private y = 0

  constructor(
    private doc: PDFDocument,
    private fonts: { body: PDFFont; bold: PDFFont; heading: PDFFont }
  ) {}

  newPage(): void {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    this.y = PAGE_HEIGHT - MARGIN
  }

  private ensureSpace(height: number): void {
    if (this.y - height < MARGIN + 30) this.newPage()
  }

  text(text: string, opts: { font?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; indent?: number; lineHeight?: number } = {}): void {
    const font = opts.font ?? this.fonts.body
    const size = opts.size ?? BODY_SIZE
    const indent = opts.indent ?? 0
    const lineHeight = opts.lineHeight ?? LINE_HEIGHT
    for (const line of wrap(toWinAnsi(text), font, size, CONTENT_WIDTH - indent)) {
      this.ensureSpace(lineHeight)
      this.y -= lineHeight
      this.page.drawText(line, { x: MARGIN + indent, y: this.y, size, font, color: opts.color ?? INK })
    }
  }

  gap(height: number): void {
    this.y -= height
  }

  heading(title: string): void {
    // Keep a heading together with at least a few lines of its text.
    this.ensureSpace(120)
    this.gap(10)
    this.text(title, { font: this.fonts.heading, size: 19, color: SAGE, lineHeight: 25 })
    this.page.drawLine({
      start: { x: MARGIN, y: this.y - 11 },
      end: { x: MARGIN + 60, y: this.y - 11 },
      thickness: 2,
      color: SAGE
    })
    this.gap(22)
  }

  /** Light Markdown body: paragraphs, "- " bullets, "### " sub-headings. */
  body(markdown: string): void {
    const blocks = markdown.replace(/\r/g, "").split(/\n\s*\n/)
    for (const raw of blocks) {
      const block = raw.trim().replace(/\*\*/g, "").replace(/(^|\s)_([^_]+)_/g, "$1$2")
      if (!block) continue
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean)
      if (lines.every(l => /^[-*•]\s+/.test(l) || /^\d+[.)]\s+/.test(l))) {
        for (const item of lines) {
          const numbered = item.match(/^(\d+)[.)]\s+(.*)$/)
          const label = numbered ? `${numbered[1]}.` : "•"
          const content = numbered ? numbered[2] ?? "" : item.replace(/^[-*•]\s+/, "")
          this.ensureSpace(LINE_HEIGHT)
          this.page.drawText(label, { x: MARGIN + 6, y: this.y - LINE_HEIGHT, size: BODY_SIZE, font: this.fonts.bold, color: SAGE })
          this.text(content, { indent: 22 })
          this.gap(3)
        }
      } else if (/^#{1,6}\s+/.test(lines[0] ?? "")) {
        // Keep a sub-heading together with the first lines under it.
        this.ensureSpace(LINE_HEIGHT * 4)
        this.gap(6)
        this.text((lines[0] ?? "").replace(/^#{1,6}\s+/, ""), { font: this.fonts.bold, size: 12.5 })
        if (lines.length > 1) this.text(lines.slice(1).join(" "))
      } else {
        this.text(lines.join(" "))
      }
      this.gap(8)
    }
  }

  titlePage(title: string, subtitle: string, intro: string[]): void {
    this.newPage()
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: CREAM })
    this.page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 14, width: PAGE_WIDTH, height: 14, color: SAGE })
    this.y = PAGE_HEIGHT - 230
    this.text(title, { font: this.fonts.heading, size: 32, color: INK, lineHeight: 40 })
    this.gap(10)
    this.text(subtitle, { size: 14, color: SAGE, lineHeight: 20 })
    this.gap(30)
    for (const line of intro) {
      this.text(line, { size: 11, color: MUTED })
      this.gap(4)
    }
  }

  footers(footer: string): void {
    const pages = this.doc.getPages()
    pages.forEach((page, index) => {
      if (index === 0) return
      const label = toWinAnsi(`${footer}   ·   ${index + 1} / ${pages.length}`)
      const width = this.fonts.body.widthOfTextAtSize(label, 8.5)
      page.drawText(label, { x: (PAGE_WIDTH - width) / 2, y: 30, size: 8.5, font: this.fonts.body, color: MUTED })
    })
  }
}

export async function buildGuidePdf(guide: GuideDocument): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(toWinAnsi(guide.title))
  doc.setSubject(toWinAnsi(guide.subtitle))
  doc.setCreator("Fluid Intimacy")
  const fonts = {
    body: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    heading: await doc.embedFont(StandardFonts.TimesRomanBold)
  }
  const writer = new Writer(doc, fonts)
  writer.titlePage(guide.title, guide.subtitle, guide.intro)
  for (const chapter of guide.chapters) {
    writer.newPage()
    writer.heading(chapter.title)
    writer.body(chapter.body)
  }
  writer.footers(guide.footer)
  return doc.save()
}
