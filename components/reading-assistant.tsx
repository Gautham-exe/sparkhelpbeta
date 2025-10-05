"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, Loader2, BookOpen } from "lucide-react"
import { runFeature } from "@/lib/api-client"

export function ReadingAssistant() {
  const [input, setInput] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [targetLang, setTargetLang] = useState("english")
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleTranslateAndRead = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const { output } = await runFeature({
        featureKey: "readingAssistant",
        userInput: `Translate this text to ${targetLang} and provide it in a clear, readable format:\n\n${input}`,
      })
      setTranslatedText(output)
    } catch (error) {
      console.error("Translation error:", error)
      setTranslatedText("Translation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpeak = () => {
    if (!translatedText) return
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return

    const langCodes: Record<string, string> = {
      english: "en-US",
      hindi: "hi-IN",
      kannada: "kn-IN",
    }
    const targetCode = langCodes[targetLang] || "en-US"

    const getBestVoice = (voices: SpeechSynthesisVoice[], code: string) => {
      // exact match first
      let v = voices.find((voice) => voice.lang.toLowerCase() === code.toLowerCase())
      if (v) return v
      // startsWith match (e.g., "kn" to "kn-IN")
      const base = code.split("-")[0].toLowerCase()
      v = voices.find((voice) => voice.lang.toLowerCase().startsWith(base))
      if (v) return v
      // any voice that includes the base script
      v = voices.find((voice) => voice.lang.toLowerCase().includes(base))
      return v || voices[0]
    }

    const speakChunk = (chunk: string, voice?: SpeechSynthesisVoice) => {
      const u = new SpeechSynthesisUtterance(chunk)
      u.lang = targetCode
      u.rate = 0.9
      u.pitch = 1
      if (voice) u.voice = voice
      u.onstart = () => setIsSpeaking(true)
      u.onend = () => {
        // no-op here; overall completion handled outside
      }
      u.onerror = () => {
        // graceful failure per chunk
      }
      window.speechSynthesis.speak(u)
    }

    // split into manageable chunks to improve reliability
    const makeChunks = (text: string, maxLen = 180) => {
      const sentences = text
        .replace(/\n+/g, " ")
        .split(/(?<=[.!?।]|[\u0C80-\u0CFF]।)/) // also consider devanagari/indic separators loosely
        .map((s) => s.trim())
        .filter(Boolean)

      const chunks: string[] = []
      let current = ""
      for (const s of sentences) {
        if ((current + " " + s).trim().length > maxLen) {
          if (current) chunks.push(current.trim())
          current = s
        } else {
          current = current ? current + " " + s : s
        }
      }
      if (current) chunks.push(current.trim())
      return chunks.length ? chunks : [text]
    }

    // voices may not be loaded immediately; getVoices twice if needed
    let voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) {
      // Attempt to load, then proceed
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices()
        const voice = getBestVoice(voices, targetCode)
        const chunks = makeChunks(translatedText)
        chunks.forEach((c, i) => speakChunk(c, voice))
        // track final end by polling queue
        const iv = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            clearInterval(iv)
            setIsSpeaking(false)
          }
        }, 300)
      }
      // trigger voices load
      window.speechSynthesis.getVoices()
    } else {
      const voice = getBestVoice(voices, targetCode)
      const chunks = makeChunks(translatedText)
      chunks.forEach((c) => speakChunk(c, voice))
      const iv = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(iv)
          setIsSpeaking(false)
        }
      }, 300)
    }
  }

  const handleStop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Read in Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="kannada">Kannada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Enter text in any language to translate and read aloud..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] md:min-h-[150px] resize-none"
          />

          <Button onClick={handleTranslateAndRead} disabled={isLoading || !input.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
            Translate & Prepare
          </Button>
        </div>
      </Card>

      {translatedText && (
        <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Translated Text ({targetLang})
            </h3>
            <Button
              onClick={isSpeaking ? handleStop : handleSpeak}
              variant={isSpeaking ? "destructive" : "default"}
              size="sm"
              className="w-full sm:w-auto"
            >
              {isSpeaking ? "Stop Reading" : "Read Aloud"}
            </Button>
          </div>
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{translatedText}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
