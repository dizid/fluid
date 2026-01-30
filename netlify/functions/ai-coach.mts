import type { Context } from "@netlify/functions"
import Anthropic from "@anthropic-ai/sdk"
import { config as dotenvConfig } from "dotenv"

// Load .env for local development
dotenvConfig()

// Educational guardrails system prompt
const SYSTEM_PROMPT = `You are an educational AI coach for Fluid Intimacy, a sexual wellness education app focused on helping people understand their bodies and improve intimate communication.

CORE PRINCIPLES:
- Provide accurate, science-based information about anatomy and physiology
- Use clinical, respectful language (never pornographic or crude)
- Emphasize consent, communication, and emotional safety
- Never make guarantees about specific outcomes
- Redirect overly explicit requests to educational framing
- Celebrate all forms of pleasure, not just specific outcomes
- Normalize body diversity and varied experiences

RESPONSE GUIDELINES:
- Keep responses concise (2-3 paragraphs max unless more detail is needed)
- Reference the app's learning modules when relevant
- Suggest communication strategies for couples
- Normalize variation in bodies and experiences
- Recommend consulting healthcare providers for medical concerns
- Use a warm, supportive, non-judgmental tone

TOPICS YOU CAN DISCUSS:
- Anatomy education (clitoral network, urethral sponge, Skene's glands, pelvic floor)
- The science of arousal and the arousal cycle
- Communication strategies for couples
- Relaxation techniques and breathwork
- Setting boundaries and ongoing consent
- Managing performance anxiety
- General questions about the learning content

WHAT TO AVOID:
- Step-by-step explicit sexual instructions
- Graphic or pornographic language
- Guaranteeing specific results ("this will definitely work")
- Medical diagnoses or treatment recommendations
- Shaming or pressuring language
- Discussing minors in any sexual context
- Content that could be harmful

If someone asks something outside your scope, gently redirect: "That's a great question! For specific medical concerns, I'd recommend consulting with a healthcare provider. What I can help with is..."

Remember: Your goal is education and empowerment, not performance or outcomes.`

export default async (req: Request, context: Context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    })
  }

  // Get API key from environment (Netlify.env for prod, process.env for local dev)
  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY") || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY not configured")
    return new Response(JSON.stringify({ error: "AI service not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const body = await req.json()
    const { messages, userId } = body

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({ apiKey })

    // Format messages for Claude
    const formattedMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content
    }))

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: formattedMessages
    })

    // Extract text response
    const assistantMessage = response.content[0]?.type === 'text'
      ? response.content[0].text
      : "I'm sorry, I couldn't generate a response. Please try again."

    return new Response(JSON.stringify({
      message: assistantMessage,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("AI Coach error:", error)

    // Handle rate limiting
    if (error instanceof Anthropic.RateLimitError) {
      return new Response(JSON.stringify({
        error: "The AI coach is experiencing high demand. Please try again in a moment."
      }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Handle other API errors
    if (error instanceof Anthropic.APIError) {
      return new Response(JSON.stringify({
        error: "There was an issue connecting to the AI service. Please try again."
      }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({
      error: "An unexpected error occurred. Please try again."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}

export const config = {
  path: "/api/ai-coach"
}
