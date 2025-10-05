import { NextResponse } from "next/server"
import { PROMPTS } from "@/lib/prompts"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { featureKey, userInput, imageData } = await req.json()

    if (!featureKey || typeof featureKey !== "string") {
      return NextResponse.json({ error: "Missing featureKey" }, { status: 400 })
    }
    if (typeof userInput !== "string" || userInput.trim().length === 0) {
      return NextResponse.json({ error: "Missing userInput" }, { status: 400 })
    }

    const FEATURE_ALIASES: Record<string, keyof typeof PROMPTS> = {
      readingassistant: "aiReader",
      reader: "aiReader",
      readaloud: "aiReader",
      "ai-reader": "aiReader",
    }
    const rawKey = String(featureKey).trim()
    const lower = rawKey.toLowerCase()
    const normalizedKey = (PROMPTS as Record<string, string>)[rawKey]
      ? rawKey
      : FEATURE_ALIASES[lower] && (PROMPTS as Record<string, string>)[FEATURE_ALIASES[lower]]
        ? FEATURE_ALIASES[lower]
        : rawKey

    const systemPrompt = (PROMPTS as Record<string, string>)[normalizedKey]
    if (!systemPrompt) {
      return NextResponse.json({ error: "Invalid featureKey" }, { status: 400 })
    }

    const hasImage = typeof imageData === "string" && imageData.length > 0

    // Provider keys
    const GROQ_API_KEY = process.env.GROQ_API_KEY
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    if (hasImage) {
      if (!GROQ_API_KEY) {
        return NextResponse.json(
          {
            error: "Image requests require a vision-capable model. Groq integration is required for vision features.",
          },
          { status: 400 },
        )
      }

      try {
        const groq = createGroq({ apiKey: GROQ_API_KEY })

        // Try Llama 4 Scout first (best for vision)
        const visionModels = ["llama-3.2-90b-vision-preview", "meta-llama/llama-4-scout-17b-16e-instruct"]

        let result
        let lastError

        for (const model of visionModels) {
          try {
            console.log(`[v0] Trying vision model: ${model}`)

            result = await generateText({
              model: groq(model),
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: `${systemPrompt.trim()}\n\nUser Input:\n${userInput.trim()}` },
                    { type: "image", image: imageData },
                  ],
                },
              ],
            })

            console.log(`[v0] Vision model ${model} succeeded`)
            break
          } catch (err: any) {
            console.log(`[v0] Vision model ${model} failed:`, err.message)
            lastError = err
            continue
          }
        }

        if (!result) {
          throw lastError || new Error("All vision models failed")
        }

        return NextResponse.json({ output: result.text })
      } catch (err: any) {
        console.log("[v0] Vision processing error:", err.message)
        return NextResponse.json({ error: `AI processing failed: ${err.message}` }, { status: 500 })
      }
    }

    // Text-only path
    // Try Groq first (fast, high quality)
    if (GROQ_API_KEY) {
      const envModel = (process.env.GROQ_MODEL || "").trim()
      const groqModel = envModel && !envModel.startsWith("gsk_") ? envModel : "llama-3.3-70b-versatile"

      console.log("[v0] Using Groq model:", groqModel)

      const callGroq = async (model: string) => {
        return fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt.trim() },
              { role: "user", content: userInput.trim() },
            ],
            temperature: 0.7,
            max_tokens: 4096, // Added max_tokens to prevent empty responses
          }),
        })
      }

      let res = await callGroq(groqModel)

      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const text = data?.choices?.[0]?.message?.content || ""
        if (!text) {
          console.log("[v0] Empty response from Groq. Full response:", JSON.stringify(data)) // Added debug logging for empty responses
          return NextResponse.json({ error: "Empty response from Groq" }, { status: 502 })
        }
        return NextResponse.json({ output: text })
      } else {
        const errTxt = await res.text().catch(() => "")
        console.log("[v0] Groq request failed:", res.status, errTxt || res.statusText)

        const isDecommissioned =
          errTxt.includes("model_decommissioned") ||
          errTxt.includes("no longer supported") ||
          errTxt.includes("model_not_found")

        const hasCustomEnvModel = !!envModel && !envModel.startsWith("gsk_")
        const safeDefault = "llama-3.3-70b-versatile"

        if (isDecommissioned && hasCustomEnvModel && groqModel !== safeDefault) {
          console.log("[v0] Retrying Groq with safe default model:", safeDefault)
          res = await callGroq(safeDefault)
          if (res.ok) {
            const data = await res.json().catch(() => ({}))
            const text = data?.choices?.[0]?.message?.content || ""
            if (!text) {
              return NextResponse.json({ error: "Empty response from Groq (retry)" }, { status: 502 })
            }
            return NextResponse.json({ output: text })
          } else {
            const retryErr = await res.text().catch(() => "")
            console.log("[v0] Groq retry failed:", res.status, retryErr || res.statusText)
          }
        }
      }
    }

    if (OPENROUTER_API_KEY) {
      const model = "meta-llama/llama-3.1-70b-instruct"
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://v0.app",
          "X-Title": "AI Study Suite",
        } as any,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt.trim() },
            { role: "user", content: userInput.trim() },
          ],
        }),
      })

      if (!res.ok) {
        const errTxt = await res.text().catch(() => "")
        return NextResponse.json(
          { error: `OpenRouter request failed: ${errTxt || res.statusText}` },
          { status: res.status },
        )
      }

      const data = await res.json().catch(() => ({}))
      const text = data?.choices?.[0]?.message?.content || ""
      if (!text) {
        return NextResponse.json({ error: "Empty response from OpenRouter" }, { status: 502 })
      }
      return NextResponse.json({ output: text })
    }

    // No providers available
    return NextResponse.json(
      {
        error: "No AI providers configured. Add GROQ_API_KEY or OPENROUTER_API_KEY in Project Settings.",
      },
      { status: 500 },
    )
  } catch (err: any) {
    console.log("[v0] generate API error:", err?.name, err?.message)
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 })
  }
}
