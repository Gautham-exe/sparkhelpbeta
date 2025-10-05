"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Code, Copy, Check } from "lucide-react"
import { runFeature } from "@/lib/api-client"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

export function VoiceToCode() {
  const [input, setInput] = useState("")
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const result = await runFeature({
        featureKey: "voiceToCode",
        userInput: input,
      })
      setCode(result)

      // Detect language from code
      if (result.includes("def ") || result.includes("import ")) setLanguage("python")
      else if (result.includes("function") || result.includes("const")) setLanguage("javascript")
      else if (result.includes("public class")) setLanguage("java")
      else if (result.includes("#include")) setLanguage("cpp")
    } catch (error) {
      console.error("Code generation error:", error)
      setCode("// Failed to generate code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the code you want to generate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] md:min-h-[150px] resize-none"
          />

          <Button onClick={handleGenerate} disabled={isLoading || !input.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Code className="mr-2 h-4 w-4" />}
            Generate Code
          </Button>
        </div>
      </Card>

      {code && (
        <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code className="h-5 w-5" />
              Generated Code
            </h3>
            <Button onClick={handleCopy} variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Code"}
            </Button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border max-h-[600px] overflow-y-auto">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: "1.5rem",
                fontSize: "0.875rem",
                lineHeight: "1.5",
              }}
              showLineNumbers
              wrapLongLines
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </Card>
      )}
    </div>
  )
}
