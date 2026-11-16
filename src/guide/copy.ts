/**
 * Short sales copy for /guide (T-0594). Based on DeepSeek's draft (board T-0604),
 * edited by Claude so every line matches what the product really does.
 */
export const GUIDE_COPY = {
  quizIntro:
    'Answer five short questions. You get free lesson picks right away, and you can turn your answers into a private PDF guide with a personal plan.',
  guide:
    'Built from your answers: your focus, your level, what gets in the way, and a 4-week rhythm that fits your time, plus a safety checklist. Download it right after paying.',
  deepdive:
    'Everything in the personal guide, plus six deeper chapters (arousal anatomy, relaxation, the arousal curve, pelvic floor, fluids, aftercare) and a 30-day plan of small, optional practices with rest days.',
  couples:
    'Adds partner chapters to the PDF you choose: shared pace and a stop word, how to support each other without pressure, and conversation starters.',
  faq: [
    {
      q: 'Is it private?',
      a: 'Yes. Until you pay, your answers stay in this browser. When you pay, they are saved with your payment at Stripe, our payment provider, only so we can build your PDF. No account, no mailing list.'
    },
    {
      q: 'Do I need an account?',
      a: 'No. You pay and download without creating an account.'
    },
    {
      q: 'How do I get the PDF?',
      a: 'You download it right after paying. Bookmark that page: its link downloads your PDF again later.'
    },
    {
      q: 'Is this medical advice?',
      a: 'No. This is education for adults. It does not replace care from a doctor, sexologist or pelvic floor physiotherapist.'
    }
  ]
}

/** Where buyers can write when a download fails (Marc's dev address, also used by ClientPilot and Foreground). */
export const SUPPORT_EMAIL = 'dev@dizid.com'
