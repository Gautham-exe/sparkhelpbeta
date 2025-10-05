"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Sparkles, AlertCircle, CheckCircle, TrendingUp, Shield, Award, BookOpen } from "lucide-react"
import { runFeature } from "@/lib/api-client"

interface EvaluationResult {
  grade: number
  rating: string
  correctAnswer: string
  whatsMissing: string[]
  errors: string[]
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  aiDetection: {
    isLikelyAI: boolean
    confidence: number
    indicators: string[]
    reasoning: string
  }
}

export function PhotoEvaluator() {
  const [input, setInput] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!input && !image) return

    setLoading(true)
    try {
      let imageData: string | undefined = undefined
      if (image) {
        const reader = new FileReader()
        imageData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(image)
        })
      }

      const response = await runFeature({
        featureKey: "questionEvaluator",
        userInput: input || "Evaluate this answer from the image",
        imageData: imageData || null,
      })

      const outputText = response.output

      try {
        const parsed = JSON.parse(outputText)
        setResult(parsed)
      } catch {
        setResult({
          grade: 0,
          rating: "Unknown",
          correctAnswer: outputText,
          whatsMissing: [],
          errors: [],
          strengths: [],
          improvements: [],
          detailedFeedback: outputText,
          aiDetection: {
            isLikelyAI: false,
            confidence: 0,
            indicators: [],
            reasoning: "Unable to analyze",
          },
        })
      }
    } catch (error) {
      console.error("Evaluation error:", error)
      alert(`Evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-400"
    if (grade >= 7) return "text-blue-400"
    if (grade >= 5) return "text-yellow-400"
    return "text-red-400"
  }

  const getGradeBg = (grade: number) => {
    if (grade >= 9) return "from-green-600/20 to-green-800/20 border-green-500/30"
    if (grade >= 7) return "from-blue-600/20 to-blue-800/20 border-blue-500/30"
    if (grade >= 5) return "from-yellow-600/20 to-yellow-800/20 border-yellow-500/30"
    return "from-red-600/20 to-red-800/20 border-red-500/30"
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Input Section */}
      <Card className="p-4 md:p-6 bg-background/50 border-border backdrop-blur-sm">
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the question and expected answer, or upload a photo of the student's answer..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] md:min-h-[150px] bg-background/50 border-border resize-none"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Answer Photo
                </span>
              </Button>
            </label>

            <Button
              onClick={handleSubmit}
              disabled={loading || (!input && !image)}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? "Evaluating..." : "Evaluate Answer"}
            </Button>
          </div>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full h-auto rounded-lg border-2 border-border"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <Card className={`p-6 md:p-8 bg-gradient-to-br ${getGradeBg(result.grade)} md:col-span-2`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-3 sm:gap-4">
                  <p className={`text-6xl md:text-7xl font-bold ${getGradeColor(result.grade)}`}>{result.grade}/10</p>
                  <div>
                    <p className="text-xl md:text-2xl font-semibold text-foreground">{result.rating}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">Based on answer quality</p>
                  </div>
                </div>
              </div>
              <Award className={`w-16 h-16 md:w-24 md:h-24 ${getGradeColor(result.grade)} opacity-50`} />
            </div>
          </Card>

          {result.improvements && result.improvements.length > 0 && (
            <Card className="p-4 md:p-6 bg-card border-blue-500/30">
              <div className="flex items-start gap-3 md:gap-4">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">How to Improve</h3>
                  <ul className="space-y-2">
                    {result.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">→</span>
                        <span className="text-sm md:text-base text-muted-foreground">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {result.whatsMissing && result.whatsMissing.length > 0 && (
            <Card className="p-4 md:p-6 bg-card border-orange-500/30">
              <div className="flex items-start gap-3 md:gap-4">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-orange-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">What's Missing</h3>
                  <ul className="space-y-2">
                    {result.whatsMissing.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        <span className="text-sm md:text-base text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {result.errors && result.errors.length > 0 && (
            <Card className="p-4 md:p-6 bg-card border-red-500/30 md:col-span-2">
              <div className="flex items-start gap-3 md:gap-4">
                <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Errors Found</h3>
                  <ul className="space-y-2">
                    {result.errors.map((error, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">✗</span>
                        <span className="text-sm md:text-base text-muted-foreground">{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {result.strengths && result.strengths.length > 0 && (
            <Card className="p-4 md:p-6 bg-card border-green-500/30 md:col-span-2">
              <div className="flex items-start gap-3 md:gap-4">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span className="text-sm md:text-base text-muted-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4 md:p-6 bg-card border-purple-500/30 md:col-span-2">
            <div className="flex items-start gap-3 md:gap-4">
              <Shield
                className={`w-6 h-6 md:w-8 md:h-8 flex-shrink-0 ${result.aiDetection.isLikelyAI ? "text-red-400" : "text-green-400"}`}
              />
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">AI Detection Analysis</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm md:text-base text-muted-foreground mb-1">
                      <span className="font-semibold">Status:</span>{" "}
                      {result.aiDetection.isLikelyAI ? (
                        <span className="text-red-400">⚠️ Possibly AI-Generated</span>
                      ) : (
                        <span className="text-green-400">✓ Appears Human-Written</span>
                      )}
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground">
                      <span className="font-semibold">Confidence:</span> {result.aiDetection.confidence}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">{result.aiDetection.reasoning}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border md:col-span-2">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Correct Answer</h3>
            <div className="prose prose-sm md:prose-base prose-invert max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{result.correctAnswer}</p>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border md:col-span-2">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Detailed Feedback</h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{result.detailedFeedback}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
