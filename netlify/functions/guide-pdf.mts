import type { Config, Context } from "@netlify/functions"
import Stripe from "stripe"
import { isProductKey, isValidAnswers, QUIZ } from "../../src/guide/quiz.ts"
import { STRIPE_APP_TAG } from "../lib/stripe-tag.ts"
import { assembleGuide } from "../lib/guide-assembly.ts"
import { buildGuidePdf } from "../lib/pdf-builder.ts"

/**
 * GET /api/guide-pdf?session_id=cs_... (T-0594): returns the buyer's PDF once
 * Stripe confirms that Checkout session is paid and belongs to this app. The
 * session id (long, random, only in the buyer's success link) is the key; the
 * same link downloads the PDF again later. Nothing is stored on our side.
 */

function error(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  })
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return error("Method not allowed", 405)

  const sessionId = new URL(req.url).searchParams.get("session_id") ?? ""
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) return error("This download link is not valid.", 400)

  const stripeSecretKey = Netlify.env.get("STRIPE_SECRET_KEY")
  if (!stripeSecretKey) return error("Downloads are not available right now.", 503)

  let session: Stripe.Checkout.Session
  try {
    session = await new Stripe(stripeSecretKey).checkout.sessions.retrieve(sessionId)
  } catch {
    return error("We couldn't find this purchase. Check the link from your payment page.", 404)
  }

  const meta = session.metadata ?? {}
  if (meta.app !== STRIPE_APP_TAG) return error("We couldn't find this purchase.", 404)
  if (session.payment_status !== "paid") {
    return error("Your payment hasn't been confirmed yet. Please try again in a minute.", 402)
  }

  const answers = Object.fromEntries(QUIZ.map(q => [q.key, meta[q.key]]))
  if (!isProductKey(meta.product) || !isValidAnswers(answers)) {
    console.error("guide-pdf: paid session with unexpected metadata", sessionId)
    return error("Something is wrong with this purchase. Please contact us.", 500)
  }

  try {
    const pdf = await buildGuidePdf(assembleGuide(meta.product, meta.couples === "1", answers))
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="fluid-intimacy-personal-guide.pdf"',
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex"
      }
    })
  } catch (e) {
    console.error("guide-pdf: build failed", e instanceof Error ? e.message : e)
    return error("We couldn't build your PDF. Please try again.", 500)
  }
}

export const config: Config = {
  path: "/api/guide-pdf",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] }
}
