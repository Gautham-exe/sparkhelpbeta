"use client"

import { useMemo, useState } from "react"
import useSWRMutation from "swr/mutation"
import { PROMPTS } from "@/lib/prompts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

type FeatureKey = keyof typeof PROMPTS

function titleize(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

async function postJSON(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || `Request failed with ${res.status}`)
  }
  return (await res.json()) as { output: string }
}

export function PromptRunner() {
  const featureKeys = useMemo(() => Object.keys(PROMPTS) as FeatureKey[], [])
  const [featureKey, setFeatureKey] = useState<FeatureKey>(featureKeys[0]!)
  const [userInput, setUserInput] = useState("")
  const [output, setOutput] = useState("")

  const { trigger, isMutating, error, reset } = useSWRMutation("/api/generate", postJSON)

  const selectedPrompt = PROMPTS[featureKey] ?? ""

  const exampleHint = useMemo(() => {
    const map: Partial<Record<FeatureKey, string>> = {
      handwritingToText: "Paste raw OCR text with errors to clean up...",
      mathSolver: "e.g., Solve: Integral of x^2 dx from 0 to 3",
      summaryMaker: "Paste long text to summarize into key points and flashcards...",
      translator: "Write text + target language (e.g., Translate to Spanish: ...)",
      voiceToCode: "Describe code to generate (e.g., Python sort numbers)...",
      conceptExplainer: "Topic: Photosynthesis",
    }
    return map[featureKey] ?? "Describe your task or paste content here..."
  }, [featureKey])

  async function onRun() {
    reset()
    setOutput("")
    const data = await trigger({ featureKey, userInput })
    setOutput(data.output)
  }

  function onClear() {
    setUserInput("")
    setOutput("")
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      // no-op
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-balance">Smart AI Study Suite</CardTitle>
          <CardDescription>
            Choose a capability, provide input, and generate results with best-in-class UX.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="feature">Feature</Label>
            <Select value={featureKey} onValueChange={(v) => setFeatureKey(v as FeatureKey)}>
              <SelectTrigger id="feature" className="bg-background">
                <SelectValue placeholder="Pick a feature" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {featureKeys.map((k) => (
                  <SelectItem key={k} value={k}>
                    {titleize(k)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2 pt-1">
              {featureKeys.slice(0, 6).map((k) => (
                <button
                  key={k}
                  onClick={() => setFeatureKey(k)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs transition-colors",
                    k === featureKey ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent",
                  )}
                  aria-label={`Quick select ${titleize(k)}`}
                >
                  {titleize(k)}
                </button>
              ))}
              <Badge variant="outline" className="ml-auto">
                20 features
              </Badge>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="input">Your Input</Label>
            <Textarea
              id="input"
              placeholder={exampleHint}
              className="min-h-[180px] bg-background"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Provide clear context. Math/physics answers may include {"$$LaTeX$$"} in the output.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onRun}
              disabled={isMutating || userInput.trim().length === 0}
              className="bg-primary text-primary-foreground"
            >
              {isMutating ? "Generating..." : "Generate"}
            </Button>
            <Button variant="secondary" onClick={onClear}>
              Clear
            </Button>
          </div>

          <div className="grid gap-2">
            <Label>Prompt Context (read-only)</Label>
            <pre className="rounded-md border bg-muted/50 p-3 text-xs overflow-auto">{selectedPrompt.trim()}</pre>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-balance">Result</CardTitle>
          <CardDescription>Copy, review, or iterate further.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">{error.message}</div>
          ) : null}
          <pre className="min-h-[280px] rounded-md border bg-muted/30 p-3 text-sm overflow-auto">
            {output || "Output will appear here..."}
          </pre>
          <div className="flex items-center gap-2">
            <Button onClick={onCopy} variant="outline">
              Copy Output
            </Button>
            <Badge variant="outline" className="ml-auto">
              Accessible • Keyboard-friendly
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
