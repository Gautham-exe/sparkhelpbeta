"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Mic, Download, Sparkles, StopCircle, FileText } from "lucide-react"
import { runFeature } from "@/lib/api-client"

export function VoiceDocumentEditor() {
  const [document, setDocument] = useState("")
  const [command, setCommand] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<"txt" | "pdf" | "docx">("txt")
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setCommand(transcript)
        setIsRecording(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
        alert(`Voice recognition error: ${event.error}`)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setLoading(true)

    try {
      if (file.type === "text/plain") {
        const text = await file.text()
        setDocument(text)
        setFileType("txt")
      } else if (file.type === "application/pdf") {
        // Parse PDF using browser's built-in capabilities
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/parse-document", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Failed to parse PDF")

        const data = await response.json()
        setDocument(data.text)
        setFileType("pdf")
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        // Parse DOCX
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/parse-document", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Failed to parse DOCX")

        const data = await response.json()
        setDocument(data.text)
        setFileType("docx")
      } else {
        alert("Unsupported file type. Please upload PDF, DOCX, or TXT files.")
      }
    } catch (error) {
      console.error("File upload error:", error)
      alert(`Failed to load document: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.")
      return
    }

    try {
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      alert("Could not start voice recognition. Please try again.")
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleExecuteCommand = async () => {
    if (!command || !document) return

    setLoading(true)
    try {
      const fullPrompt = `Current document content:\n${document}\n\nUser's editing command: "${command}"\n\nApply the editing command to the document and return the complete edited document. Preserve all content and only apply the requested changes.`

      const response = await runFeature({
        featureKey: "voiceDocEditor",
        userInput: fullPrompt,
        imageData: null,
      })

      setDocument(response.output)
      setCommand("")
    } catch (error) {
      console.error("Command execution error:", error)
      alert(`Command failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: "txt" | "pdf" | "docx") => {
    if (format === "txt") {
      const blob = new Blob([document], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement("a")
      a.href = url
      a.download = `edited-document.txt`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === "pdf" || format === "docx") {
      // Generate PDF/DOCX on server
      try {
        const response = await fetch("/api/export-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: document, format }),
        })

        if (!response.ok) throw new Error("Export failed")

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = window.document.createElement("a")
        a.href = url
        a.download = `edited-document.${format}`
        a.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Export error:", error)
        alert(
          `Failed to export as ${format.toUpperCase()}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6 bg-card border-border">
        <div className="flex gap-4">
          <label className="flex-1">
            <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileUpload} className="hidden" />
            <Button variant="outline" className="w-full bg-transparent" asChild disabled={loading}>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {loading ? "Loading..." : "Upload Document (PDF/DOCX/TXT)"}
              </span>
            </Button>
          </label>
        </div>
        {fileName && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>Loaded: {fileName}</span>
          </div>
        )}
      </Card>

      {/* Document Editor */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-3">Document Content</h3>
        <Textarea
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="Upload a document or paste text here..."
          className="min-h-[300px] font-mono text-sm"
        />
      </Card>

      {/* Voice Command Section */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-3">Voice Commands</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex-1"
              disabled={!document}
            >
              {isRecording ? (
                <>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Voice Command
                </>
              )}
            </Button>
          </div>

          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Or type your editing command here (e.g., 'make it bold', 'add bullet points', 'summarize this')..."
            className="min-h-[100px]"
          />

          <Button onClick={handleExecuteCommand} disabled={loading || !command || !document} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? "Processing..." : "Execute Command"}
          </Button>
        </div>
      </Card>

      {/* Download Section */}
      {document && (
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold mb-3">Export Document</h3>
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => handleDownload("txt")} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              TXT
            </Button>
            <Button onClick={() => handleDownload("pdf")} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={() => handleDownload("docx")} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              DOCX
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
