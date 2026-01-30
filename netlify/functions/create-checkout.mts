import type { Context } from "@netlify/functions"
import Stripe from "stripe"
import { config as dotenvConfig } from "dotenv"

// Load .env for local development
dotenvConfig()

export default async (req: Request, _context: Context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Netlify.env for prod, process.env for local dev
  const stripeSecretKey = Netlify.env.get("STRIPE_SECRET_KEY") || process.env.STRIPE_SECRET_KEY
  const priceId = Netlify.env.get("STRIPE_PRICE_ID") || process.env.STRIPE_PRICE_ID

  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY not configured")
    return new Response(JSON.stringify({ error: "Payment service not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  if (!priceId) {
    console.error("STRIPE_PRICE_ID not configured")
    return new Response(JSON.stringify({ error: "Product not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const body = await req.json()
    const { userId, userEmail } = body

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const stripe = new Stripe(stripeSecretKey)

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:3000"

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // Link payment to user
      client_reference_id: userId,
      customer_email: userEmail || undefined,
      // Redirect URLs
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/coach`,
      // Metadata for reference
      metadata: {
        userId,
        product: "fluid-intimacy-premium"
      }
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("Create checkout error:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return new Response(JSON.stringify({
        error: "Payment service error. Please try again."
      }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({
      error: "Failed to create checkout session"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export const config = {
  path: "/api/create-checkout"
}
