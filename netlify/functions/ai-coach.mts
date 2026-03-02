import type { Context } from "@netlify/functions"
import { GoogleGenerativeAI } from "@google/generative-ai"
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
  const apiKey = Netlify.env.get("GOOGLE_AI_API_KEY") || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    console.error("GOOGLE_AI_API_KEY not configured")
    return new Response(JSON.stringify({ error: "AI service not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const body = await req.json()
    const { messages, userId, userContext } = body

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

    // Build personalized system prompt by appending user context if provided
    let systemPrompt = SYSTEM_PROMPT
    if (userContext) {
      const contextLines: string[] = []
      if (userContext.userType) {
        contextLines.push(`The user is in ${userContext.userType} mode.`)
      }
      if (userContext.goals?.length) {
        contextLines.push(`Their learning goals: ${userContext.goals.join(', ')}.`)
      }
      if (userContext.completedModules?.length) {
        contextLines.push(`They have completed these modules: ${userContext.completedModules.join(', ')}.`)
      }
      if (userContext.overallProgress !== undefined) {
        contextLines.push(`Their overall course progress: ${userContext.overallProgress}%.`)
      }
      if (contextLines.length > 0) {
        systemPrompt += `\n\nUSER CONTEXT:\n${contextLines.join('\n')}\nUse this context to personalize your responses. Reference their goals and progress where relevant.`
      }
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt
    })

    // Convert message format: Anthropic uses "assistant", Gemini uses "model"
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1024
      }
    })

    const result = await chat.sendMessage(lastMessage.content)
    const assistantMessage = result.response.text()

    return new Response(JSON.stringify({
      message: assistantMessage
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error) {
    console.error("AI Coach error:", error)

    // Handle rate limiting
    if (error instanceof Error && error.message?.includes('429')) {
      return new Response(JSON.stringify({
        error: "The AI coach is experiencing high demand. Please try again in a moment."
      }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Handle other API errors
    if (error instanceof Error && (error.message?.includes('API') || error.message?.includes('fetch'))) {
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
