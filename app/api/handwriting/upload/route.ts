import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"

function extFromType(type: string) {
  if (type.includes("png")) return "png"
  if (type.includes("jpeg")) return "jpg"
  if (type.includes("jpg")) return "jpg"
  if (type.includes("webp")) return "webp"
  return "bin"
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return new Response("No file provided", { status: 400 })
    if (!file.type.startsWith("image/")) return new Response("Only image files are supported", { status: 400 })
    if (file.size > 10 * 1024 * 1024) return new Response("Max file size is 10MB", { status: 400 })

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL!, // server URL
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // secret key for server
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const BUCKET = "handwriting"
    const buckets = await supabase.storage.listBuckets()
    if (buckets.error) {
      return new Response(`Storage error: ${buckets.error.message}`, { status: 500 })
    }
    const exists = buckets.data?.some((b) => b.name === BUCKET)
    if (!exists) {
      const created = await supabase.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: "10MB", // string per API
      })
      if (created.error) {
        return new Response(`Bucket creation failed: ${created.error.message}`, { status: 500 })
      }
    } else {
      // If the bucket exists but is not public, update it
      const details = await supabase.storage.getBucket(BUCKET)
      if (details.error) {
        return new Response(`Bucket info failed: ${details.error.message}`, { status: 500 })
      }
      if (details.data && details.data.public === false) {
        const updated = await supabase.storage.updateBucket(BUCKET, { public: true })
        if (updated.error) {
          return new Response(`Bucket update failed: ${updated.error.message}`, { status: 500 })
        }
      }
    }

    const arrayBuf = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuf)
    const ext = extFromType(file.type)
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Prefer the original File object first; if that still fails, fall back to a Blob.
    let upload = await supabase.storage.from(BUCKET).upload(key, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

    if (upload.error) {
      // Fallback: try Blob to avoid runtime-specific FormData quirks
      const blob = new Blob([bytes], { type: file.type || "application/octet-stream" })
      upload = await supabase.storage.from(BUCKET).upload(key, blob, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })
    }

    if (upload.error) {
      return new Response(`Upload failed: ${upload.error.message}`, { status: 500 })
    }

    const pub = supabase.storage.from(BUCKET).getPublicUrl(key)
    const publicUrl = pub.data?.publicUrl
    if (!publicUrl) {
      return new Response("Could not create public URL", { status: 500 })
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    if (!GROQ_API_KEY) {
      return new Response(
        "Image OCR requires GROQ_API_KEY. Please add it in Project Settings → Environment Variables.",
        { status: 400 },
      )
    }

    try {
      const groq = createGroq({
        apiKey: GROQ_API_KEY,
      })

      // Prefer stable, supported Groq vision models with a fallback chain
      const visionModels = ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"]

      let text = ""
      let lastError: any

      for (const model of visionModels) {
        try {
          const result = await generateText({
            model: groq(model),
            // AI SDK multimodal input format
            input: [
              {
                type: "text",
                text:
                  "You are an OCR system. Extract ALL text from this image EXACTLY as written, character by character.\n\n" +
                  "RULES:\n" +
                  "- Copy the text EXACTLY as it appears\n" +
                  "- Preserve ALL line breaks, spacing, and formatting\n" +
                  "- Preserve ALL punctuation marks exactly\n" +
                  "- Do NOT add any explanations, summaries, or commentary\n" +
                  "- Do NOT interpret or rephrase anything\n" +
                  "- Do NOT add introductory text like 'Here is the text:' or 'The image contains:'\n" +
                  "- For mathematical formulas, use LaTeX notation\n" +
                  "- For diagrams or drawings, describe them briefly in [brackets]\n\n" +
                  "Output ONLY the extracted text, ready for copy-paste. Nothing else.",
              },
              {
                type: "image",
                image: publicUrl,
              },
            ],
          })

          text = result.text || ""
          if (text) break
        } catch (err: any) {
          console.error(`[v0] Vision model ${model} failed:`, err?.message)
          lastError = err
          continue
        }
      }

      if (!text) {
        throw lastError || new Error("Empty response from vision models")
      }

      return Response.json({ publicUrl, text })
    } catch (aiError: any) {
      console.error("[v0] AI SDK error:", aiError)
      return new Response(`AI processing failed: ${aiError?.message || "unknown"}`, { status: 500 })
    }
  } catch (err: any) {
    console.error("[v0] Server error:", err)
    return new Response(`Server error: ${err?.message || "unknown"}`, { status: 500 })
  }
}
