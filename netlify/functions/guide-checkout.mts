import type { Config, Context } from "@netlify/functions"
import Stripe from "stripe"
import { QUIZ, PRODUCTS, COUPLES_ADDON_CENTS, isValidAnswers, isProductKey } from "../../src/guide/quiz.ts"
import { STRIPE_APP_TAG } from "../lib/stripe-tag.ts"

/**
 * POST /api/guide-checkout (T-0594): starts a Stripe Checkout for the personal PDF
 * guide. Body: { product: 'guide' | 'deepdive', couples: boolean, answers: {...},
 * withdrawalWaiver: true }. The waiver (EU 14-day withdrawal right, T-0633) is
 * required; the time it was given is saved on the session as proof of consent.
 * Prices come from src/guide/quiz.ts (inline price data, no Stripe Price IDs).
 * The quiz answers ride along as session metadata; guide-pdf.mts builds the PDF
 * from them once Stripe says the session is paid. No account, no database.
 */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  })
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const stripeSecretKey = Netlify.env.get("STRIPE_SECRET_KEY")
  if (!stripeSecretKey) return json({ error: "Payments are not available right now." }, 503)

  let body: { product?: unknown; couples?: unknown; answers?: unknown; withdrawalWaiver?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return json({ error: "Invalid request" }, 400)
  }

  const { product, answers } = body
  const couples = body.couples === true
  if (!isProductKey(product) || !isValidAnswers(answers)) {
    return json({ error: "Please answer every question first." }, 400)
  }
  if (body.withdrawalWaiver !== true) {
    return json({ error: "Please tick the box above the button first." }, 400)
  }

  const chosen = PRODUCTS[product]
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: chosen.priceCents,
        product_data: { name: chosen.name }
      }
    }
  ]
  if (couples) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: COUPLES_ADDON_CENTS,
        product_data: { name: "Couples edition (extra chapters)" }
      }
    })
  }

  // Only known keys/values reach Stripe (validated above).
  const metadata: Record<string, string> = {
    app: STRIPE_APP_TAG,
    product,
    couples: couples ? "1" : "0",
    // When the buyer ticked the instant-delivery / withdrawal waiver box.
    withdrawal_waiver_at: new Date().toISOString()
  }
  for (const q of QUIZ) metadata[q.key] = answers[q.key]

  const origin = new URL(req.url).origin
  try {
    const stripe = new Stripe(stripeSecretKey)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata,
      payment_intent_data: { metadata, description: chosen.name },
      success_url: `${origin}/guide/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/guide?cancelled=1`
    })
    if (!session.url) return json({ error: "Could not start the payment." }, 502)
    return json({ url: session.url })
  } catch (error) {
    console.error("guide-checkout: Stripe error", error instanceof Error ? error.message : error)
    return json({ error: "Could not start the payment. Please try again." }, 502)
  }
}

export const config: Config = {
  path: "/api/guide-checkout",
  // Per visitor: enough for real use, stops a script from creating sessions in bulk.
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] }
}
