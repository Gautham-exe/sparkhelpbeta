"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Calculator } from "lucide-react"
import { runFeature } from "@/lib/api-client"

export function MathSolver() {
  const [input, setInput] = useState("")
  const [solution, setSolution] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSolve = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const result = await runFeature({
        featureKey: "mathSolver",
        userInput: input,
      })
      setSolution(result)
    } catch (error) {
      console.error("Math solving error:", error)
      setSolution("Failed to solve. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="p-4 md:p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="space-y-4">
          <Textarea
            placeholder="Enter your math problem (e.g., solve x^2 + 5x + 6 = 0)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] md:min-h-[150px] resize-none font-mono text-sm md:text-base"
          />

          <Button onClick={handleSolve} disabled={isLoading || !input.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
            Solve Problem
          </Button>
        </div>
      </Card>

      {solution && (
        <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Solution
          </h3>
          <div className="math-preview bg-background/50 p-4 md:p-6 rounded-lg border border-border overflow-x-auto">
            <div
              className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: solution
                  .replace(/\*\*/g, "")
                  .replace(/\n/g, "<br/>")
                  .replace(
                    /(\d+\/\d+)/g,
                    '<span class="inline-flex flex-col items-center text-center"><span class="border-b border-current pb-1">$1</span></span>',
                  )
                  .replace(/([+\-=×÷])/g, '<span class="mx-2 text-lg font-bold">$1</span>'),
              }}
            />
          </div>
        </Card>
      )}
    </div>
  )
}
