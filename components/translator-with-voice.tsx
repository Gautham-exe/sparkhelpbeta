"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react"
import { runFeature } from "@/lib/api-client"

export function TranslatorWithVoice() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [targetLang, setTargetLang] = useState("spanish")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("")
        setInput(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
      }
    }
  }, [])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const handleTranslate = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const { output } = await runFeature({
        featureKey: "translator",
        userInput: `Translate to ${targetLang}: ${input}`,
      })
      setOutput(output)
    } catch (error) {
      console.error("Translation error:", error)
      setOutput("Translation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={targetLang} onValueChange={setTargetLang}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Target Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="kannada">Kannada</SelectItem>
                <SelectItem value="chinese">Chinese</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              className="w-full sm:w-auto"
            >
              {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {isRecording ? "Stop Recording" : "Voice Input"}
            </Button>
          </div>

          <Textarea
            placeholder="Enter text to translate or use voice input..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] md:min-h-[150px] resize-none"
          />

          <Button onClick={handleTranslate} disabled={isLoading || !input.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Translate
          </Button>
        </div>
      </Card>

      {output && (
        <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Translation
          </h3>
          <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{output}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
