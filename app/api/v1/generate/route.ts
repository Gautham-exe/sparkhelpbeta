import { NextResponse } from "next/server"
import { PROMPTS } from "@/lib/prompts"

/**
 * v1 generate:
 * - Image → Google Generative AI (Gemini 2.0 Flash) when GOOGLE_GENERATIVE_AI_API_KEY is set
 * - Text → Groq first (llama-3.3-70b-versatile), falls back to OpenRouter
 * Response includes { version: "v1" } for easy detection.
 */
export async function POST(req: Request) {
  try {
    const { featureKey, userInput, imageData } = await req.json()

    if (!featureKey || typeof featureKey !== "string") {
      return NextResponse.json({ error: "Missing featureKey", version: "v1" }, { status: 400 })
    }
    if (typeof userInput !== "string" || userInput.trim().length === 0) {
      return NextResponse.json({ error: "Missing userInput", version: "v1" }, { status: 400 })
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
      return NextResponse.json({ error: "Invalid featureKey", version: "v1" }, { status: 400 })
    }

    const hasImage = typeof imageData === "string" && imageData.length > 0

    const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const GROQ_API_KEY = process.env.GROQ_API_KEY
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

    const dataUrlToBase64 = (dataUrl: string) => {
      try {
        const [, base64] = dataUrl.split(",")
        return base64 || ""
      } catch {
        return ""
      }
    }

    const GEMINI_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.0-flash-exp"

    if (hasImage) {
      if (GROQ_API_KEY) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "meta-llama/llama-4-scout-17b-16e-instruct",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: `${systemPrompt.trim()}\n\nUser Input:\n${userInput.trim()}` },
                    { type: "image_url", image_url: { url: imageData } },
                  ],
                },
              ],
              temperature: 0.7,
            }),
          })

          if (groqRes.ok) {
            const data = await groqRes.json()
            const text = data?.choices?.[0]?.message?.content || ""
            if (text) {
              return NextResponse.json({ output: text, version: "v1", model: "groq-vision" })
            }
          } else {
            const errTxt = await groqRes.text().catch(() => "")
            console.log("[v1] Groq vision failed, falling back to Gemini:", groqRes.status, errTxt)
          }
        } catch (err) {
          console.log("[v1] Groq vision error, falling back to Gemini:", err)
        }
      }

      if (!GOOGLE_API_KEY) {
        return NextResponse.json(
          {
            error:
              "Image requests require a vision-capable model. Add GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY to enable vision features.",
            version: "v1",
          },
          { status: 400 },
        )
      }

      const mime = imageData.includes("image/jpeg")
        ? "image/jpeg"
        : imageData.includes("image/webp")
          ? "image/webp"
          : imageData.includes("image/png")
            ? "image/png"
            : "image/png"

      const parts = [
        { text: `${systemPrompt.trim()}\n\nUser Input:\n${userInput.trim()}` },
        {
          inline_data: {
            mime_type: mime,
            data: dataUrlToBase64(imageData),
          },
        },
      ]

      const callGemini = async (model: string) =>
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts }],
            }),
          },
        )

      let res = await callGemini(GEMINI_MODEL)
      if (!res.ok) {
        const errTxt = await res.text().catch(() => "")
        console.log("[v1] Gemini request failed:", res.status, errTxt || res.statusText)

        const fallbacks = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"]
        for (const m of fallbacks) {
          if (m === GEMINI_MODEL) continue
          const retry = await callGemini(m)
          if (retry.ok) {
            res = retry
            break
          } else {
            const rTxt = await retry.text().catch(() => "")
            console.log("[v1] Gemini retry failed:", m, retry.status, rTxt || retry.statusText)
          }
        }
      }

      if (!res.ok) {
        const errTxt = await res.text().catch(() => "")
        return NextResponse.json(
          { error: `Gemini request failed: ${errTxt || res.statusText}`, version: "v1" },
          { status: res.status },
        )
      }

      const data = await res.json().catch(() => ({}))
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("\n") ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        ""

      if (!text) {
        return NextResponse.json({ error: "Empty response from Gemini", version: "v1" }, { status: 502 })
      }
      return NextResponse.json({ output: text, version: "v1" })
    }

    if (GROQ_API_KEY) {
      const envModel = (process.env.GROQ_MODEL || "").trim()
      // Prevent using API key as model name (API keys start with "gsk_")
      const groqModel = envModel && !envModel.startsWith("gsk_") ? envModel : "llama-3.3-70b-versatile"

      console.log("[v1] Using Groq model:", groqModel)

      const callGroq = async (model: string) =>
        fetch("https://api.groq.com/openai/v1/chat/completions", {
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
          }),
        })

      const res = await callGroq(groqModel)
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const text = data?.choices?.[0]?.message?.content || ""
        if (!text) {
          return NextResponse.json({ error: "Empty response from Groq", version: "v1" }, { status: 502 })
        }
        return NextResponse.json({ output: text, version: "v1" })
      } else {
        const errTxt = await res.text().catch(() => "")
        console.log("[v1] Groq request failed:", res.status, errTxt || res.statusText)

        const isDecommissioned =
          errTxt.includes("model_decommissioned") ||
          errTxt.includes("no longer supported") ||
          errTxt.includes("model_not_found")

        const hasCustomEnvModel = !!envModel && !envModel.startsWith("gsk_")
        const safeDefault = "llama-3.3-70b-versatile"

        if (isDecommissioned && hasCustomEnvModel && groqModel !== safeDefault) {
          console.log("[v1] Retrying Groq with safe default model:", safeDefault)
          const retry = await callGroq(safeDefault)
          if (retry.ok) {
            const data = await retry.json().catch(() => ({}))
            const text = data?.choices?.[0]?.message?.content || ""
            if (!text) {
              return NextResponse.json({ error: "Empty response from Groq (retry)", version: "v1" }, { status: 502 })
            }
            return NextResponse.json({ output: text, version: "v1" })
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
          "X-Title": "Sparkhelp",
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
          { error: `OpenRouter request failed: ${errTxt || res.statusText}`, version: "v1" },
          { status: res.status },
        )
      }

      const data = await res.json().catch(() => ({}))
      const text = data?.choices?.[0]?.message?.content || ""
      if (!text) {
        return NextResponse.json({ error: "Empty response from OpenRouter", version: "v1" }, { status: 502 })
      }
      return NextResponse.json({ output: text, version: "v1" })
    }

    return NextResponse.json(
      {
        error:
          "No AI providers configured. Add one or more of: GROQ_API_KEY (text), OPENROUTER_API_KEY (text), GOOGLE_GENERATIVE_AI_API_KEY (images).",
        version: "v1",
      },
      { status: 500 },
    )
  } catch (err: any) {
    console.log("[v1] generate API error:", err?.name, err?.message)
    return NextResponse.json({ error: err?.message ?? "Unknown error", version: "v1" }, { status: 500 })
  }
}
