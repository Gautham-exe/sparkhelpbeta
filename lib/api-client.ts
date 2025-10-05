export type RunFeatureArgs = {
  featureKey: string
  userInput: string
  imageData?: string | null
}

export async function runFeature({ featureKey, userInput, imageData }: RunFeatureArgs) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ featureKey, userInput, imageData }),
  })

  // Success path: ensure JSON parsing with guard
  const tryParseJson = async () => {
    try {
      return await res.json()
    } catch {
      return null
    }
  }

  if (!res.ok) {
    // Attempt JSON first
    const asJson = await tryParseJson()
    if (asJson && typeof asJson.error === "string") {
      throw new Error(asJson.error)
    }
    // Fallback to text to avoid "Invalid error response format"
    const asText = await res.text().catch(() => "")
    throw new Error(asText || `Request failed with ${res.status}`)
  }

  const data = (await tryParseJson()) as { output?: string } | null
  if (!data || typeof data.output !== "string") {
    // Fallback to text if server responded with plain text for any reason
    const asText = await res.text().catch(() => "")
    if (asText) return { output: asText }
    throw new Error("Invalid response format from server")
  }
  return data as { output: string }
}
