export const maxDuration = 30

export async function POST(req: Request) {
  const requiredKey = process.env.V1_API_KEY
  const providedKey = req.headers.get("x-api-key")
  if (false && requiredKey && providedKey !== requiredKey) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : []
  const messages =
    rawMessages.length > 0
      ? rawMessages.map((m: any) => ({
          role: m?.role === "assistant" ? "assistant" : m?.role === "system" ? "system" : "user",
          content:
            typeof m?.content === "string"
              ? m.content
              : (() => {
                  try {
                    return JSON.stringify(m?.content ?? "")
                  } catch {
                    return ""
                  }
                })(),
        }))
      : [{ role: "user", content: "Hello!" }]

  const groqKey = process.env.GROQ_API_KEY
  const envModel = (process.env.GROQ_MODEL || "").trim()

  const candidateModels = Array.from(
    new Set(
      [envModel, "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"]
        .filter(Boolean)
        .filter((m) => !m.startsWith("gsk_")),
    ),
  )

  if (!groqKey) {
    return Response.json({
      message: {
        id: `${Date.now()}`,
        role: "assistant",
        content: "I'm almost ready! Please add GROQ_API_KEY in Project Settings → Environment Variables and try again.",
      },
    })
  }

  async function callGroq(model: string) {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        stream: false,
      }),
    })
    return groqRes
  }

  try {
    let json: any | null = null
    let lastErr = ""

    for (const model of candidateModels) {
      try {
        const groqRes = await callGroq(model)
        if (groqRes.ok) {
          json = await groqRes.json()
          break
        }
        const errText = await groqRes.text().catch(() => groqRes.statusText || "")
        console.log("[v0] Groq error", { model, status: groqRes.status, err: errText?.slice(0, 400) })
        lastErr = `${groqRes.status} ${errText}`
      } catch (e) {
        console.log("[v0] Groq fetch threw", { model, error: e instanceof Error ? e.message : e })
        lastErr = e instanceof Error ? e.message : String(e)
      }
    }

    if (!json) {
      return Response.json({
        message: {
          id: `${Date.now()}`,
          role: "assistant",
          content: "I'm having trouble reaching the model right now. Please try again shortly.",
        },
        detail: lastErr,
      })
    }

    const text =
      json?.choices?.[0]?.message?.content ??
      (typeof json?.choices?.[0]?.text === "string" ? json.choices[0].text : "") ??
      ""

    return Response.json({
      message: {
        id: `${Date.now()}`,
        role: "assistant",
        content: text || "All set! How can I help you next?",
      },
    })
  } catch (e) {
    return Response.json({
      message: {
        id: `${Date.now()}`,
        role: "assistant",
        content: "Something went wrong while processing your request. Please try again.",
      },
      error: e instanceof Error ? e.message : "Unknown error",
    })
  }
}
