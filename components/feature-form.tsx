"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { runFeature } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Sparkles, Copy, Trash2 } from "lucide-react"

type Props = {
  title: string
  description?: string
  featureKey: string
  placeholder?: string
  acceptImage?: boolean
  enableVoice?: boolean
}

export function FeatureForm({ title, description, featureKey, placeholder, acceptImage, enableVoice }: Props) {
  const [userInput, setUserInput] = useState("")
  const [imageData, setImageData] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voiceActive, setVoiceActive] = useState(false)
  const recognitionRef = useRef<any>(null)

  const onFileChange = (file: File | null) => {
    if (!file) {
      setImageData(null)
      setPreviewUrl(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setImageData(result)
      setPreviewUrl(URL.createObjectURL(file))
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async () => {
    setLoading(true)
    setError(null)
    setOutput("")
    try {
      const { output } = await runFeature({
        featureKey,
        userInput: userInput.trim(),
        imageData,
      })
      setOutput(output)
    } catch (e: any) {
      setError(e?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const stopVoice = useCallback(() => {
    setVoiceActive(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop?.()
      recognitionRef.current = null
    }
  }, [])

  const startVoice = useCallback(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setError("Speech recognition not supported in this browser.")
        return
      }
      const recognition = new SpeechRecognition()
      recognition.lang = "en-US"
      recognition.continuous = true
      recognition.interimResults = true
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0]?.transcript || "")
          .join(" ")
        setUserInput(transcript)
      }
      recognition.onend = () => setVoiceActive(false)
      recognition.onerror = () => setVoiceActive(false)
      recognitionRef.current = recognition
      setVoiceActive(true)
      recognition.start()
    } catch {
      setError("Failed to start voice recognition.")
    }
  }, [])

  useEffect(() => {
    return () => {
      stopVoice()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [stopVoice, previewUrl])

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <Card className="bg-card gaming-card-hover animate-pixelate-in border-2">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-accent-2/5">
          <CardTitle className="text-pretty text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-accent-2 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          {description ? <CardDescription className="text-pretty text-base">{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="input" className="text-base font-semibold">
              Your Input
            </Label>
            <Textarea
              id="input"
              placeholder={placeholder || "Type here..."}
              className="min-h-[160px] bg-background border-2 focus:border-primary transition-colors"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            {enableVoice ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={voiceActive ? "secondary" : "default"}
                  className={`gaming-button-hover ${voiceActive ? "animate-glow-pulse" : ""}`}
                  onClick={voiceActive ? stopVoice : startVoice}
                >
                  {voiceActive ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                  {voiceActive ? "Stop Voice" : "Use Voice"}
                </Button>
                <Badge variant="outline" className="border-accent text-accent">
                  Experimental
                </Badge>
              </div>
            ) : null}
          </div>

          {acceptImage ? (
            <div className="grid gap-2">
              <Label htmlFor="image" className="text-base font-semibold">
                Optional Image
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="border-2 focus:border-accent transition-colors cursor-pointer"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                <div className="text-sm text-muted-foreground animate-slide-up-bounce">
                  <p className="mb-2 font-medium">Preview:</p>
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Selected upload preview"
                    className="mt-2 h-40 w-auto rounded-md border-2 object-contain gaming-card-hover"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              onClick={onSubmit}
              disabled={loading || userInput.trim().length === 0}
              className="bg-primary text-primary-foreground gaming-button-hover"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setUserInput("")
                setImageData(null)
                setPreviewUrl(null)
                setOutput("")
                setError(null)
              }}
              className="gaming-button-hover"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output)
                } catch {}
              }}
              disabled={!output}
              className="gaming-button-hover"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Output
            </Button>
          </div>

          {error ? (
            <div className="rounded-md border-2 border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive animate-slide-up-bounce">
              <strong>Error:</strong> {error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label className="text-base font-semibold">Result</Label>
            <pre className="min-h-[220px] rounded-md border-2 bg-muted/30 p-4 text-sm overflow-auto font-mono whitespace-pre-wrap">
              {output || "Output will appear here..."}
            </pre>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
