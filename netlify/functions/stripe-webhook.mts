import type { Context } from "@netlify/functions"
import Stripe from "stripe"
import { initializeApp, cert, getApps, type App } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { config as dotenvConfig } from "dotenv"

// Load .env for local development
dotenvConfig()

// Initialize Firebase Admin (singleton)
let firebaseApp: App

function getFirebaseApp(): App {
  if (getApps().length === 0) {
    const serviceAccount = Netlify.env.get("FIREBASE_SERVICE_ACCOUNT") || process.env.FIREBASE_SERVICE_ACCOUNT
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT not configured")
    }
    firebaseApp = initializeApp({
      credential: cert(JSON.parse(serviceAccount))
    })
  }
  return firebaseApp || getApps()[0]
}

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
  const webhookSecret = Netlify.env.get("STRIPE_WEBHOOK_SECRET") || process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    console.error("Stripe configuration missing")
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  const stripe = new Stripe(stripeSecretKey)

  // Get the raw body and signature
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    console.error("Missing stripe-signature header")
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Initialize Firebase Admin and get Firestore
  let db: ReturnType<typeof getFirestore>
  try {
    getFirebaseApp()
    db = getFirestore()
  } catch (error) {
    console.error("Firebase initialization error:", error)
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    switch (event.type) {
      // Payment successful - activate premium
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id

        if (!userId) {
          console.error("No client_reference_id in checkout session")
          break
        }

        if (session.payment_status !== "paid") {
          console.log(`Payment not completed for session ${session.id}`)
          break
        }

        await db.collection("users").doc(userId).update({
          isPremium: true,
          premiumActivatedAt: new Date().toISOString(),
          stripeSessionId: session.id,
          stripeCustomerId: session.customer || null
        })

        console.log(`User ${userId} upgraded to premium`)
        break
      }

      // Checkout expired without payment
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`Checkout expired for user ${session.client_reference_id}`)
        // Could send email reminder here if desired
        break
      }

      // Refund issued - revoke premium
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        const customerId = charge.customer as string

        if (!customerId) {
          console.log("Refund without customer ID")
          break
        }

        // Find user by stripeCustomerId
        const usersSnapshot = await db
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get()

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0]
          await userDoc.ref.update({
            isPremium: false,
            premiumRevokedAt: new Date().toISOString(),
            premiumRevokeReason: "refund"
          })
          console.log(`Premium revoked for user ${userDoc.id} due to refund`)
        }
        break
      }

      // Payment failed
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment failed: ${paymentIntent.id}`, paymentIntent.last_payment_error?.message)
        // Stripe Checkout handles retry UI, so just log this
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error(`Error processing ${event.type}:`, error)
    return new Response(JSON.stringify({ error: "Processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export const config = {
  path: "/api/stripe-webhook"
}
