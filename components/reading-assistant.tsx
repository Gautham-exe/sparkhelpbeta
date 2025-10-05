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

    const utterance = new SpeechSynthesisUtterance(translatedText)

    // Set language based on selection
    const langCodes: Record<string, string> = {
      english: "en-US",
      hindi: "hi-IN",
      kannada: "kn-IN",
    }
    utterance.lang = langCodes[targetLang] || "en-US"
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
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
