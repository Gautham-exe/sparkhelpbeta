"use client"

import type React from "react"
import { useCallback, useMemo, useRef, useState } from "react"
import { Upload, Sparkles, RotateCcw } from "lucide-react"

type UploadResult = {
  publicUrl: string
  text: string
}

export default function HandwritingDropzone() {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onFileSelect = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, JPEG, or WEBP).")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("Please upload an image smaller than 10MB.")
      return
    }
    setError(null)
    setResult(null)
    setFile(f)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) onFileSelect(f)
    },
    [onFileSelect],
  )

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.kind === "file") {
          const f = item.getAsFile()
          if (f) {
            onFileSelect(f)
            break
          }
        }
      }
    },
    [onFileSelect],
  )

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  async function handleUploadAndExtract() {
    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      if (!file) {
        setError("Please select an image first.")
        setIsLoading(false)
        return
      }
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/handwriting/upload", {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Upload failed")
      }
      const data = (await res.json()) as UploadResult
      setResult(data)
    } catch (err: any) {
      setError(err?.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="space-y-6 animate-pixelate-in" onPaste={onPaste} aria-label="Handwriting image upload and OCR">
      <div className="text-sm text-muted-foreground bg-primary/5 border border-primary/20 rounded-md p-3">
        <Sparkles className="h-4 w-4 inline mr-2 text-primary" />
        Models are selected automatically based on your input. No provider or model selection needed.
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
        }}
        onDrop={onDrop}
        className={[
          "rounded-lg border-2 border-dashed p-8 w-full",
          "flex flex-col items-center justify-center text-center",
          "cursor-pointer transition-all duration-300",
          "gaming-card-hover",
          dragActive
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/30 bg-background hover:border-accent hover:bg-accent/5",
        ].join(" ")}
        aria-describedby="dropzone-help"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFileSelect(f)
          }}
        />
        <Upload className={`h-12 w-12 mb-4 ${dragActive ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
        <div className="text-base font-medium mb-2" id="dropzone-help">
          Drop an image here, click to select, or paste from clipboard
        </div>
        <div className="text-sm text-muted-foreground">Max 10MB • PNG, JPG, JPEG, WEBP</div>
        {previewUrl && (
          <div className="mt-6 w-full max-w-md animate-slide-up-bounce">
            <img
              src={previewUrl || "/placeholder.svg?height=400&width=600&query=handwriting%20preview%20image"}
              alt="Selected handwriting preview"
              className="w-full h-auto rounded-md border-2 border-primary/30"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUploadAndExtract}
          disabled={!file || isLoading}
          className="inline-flex items-center justify-center rounded-md px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 gaming-button-hover font-medium transition-all"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isLoading ? "Processing…" : "Upload & Extract"}
        </button>
        <button
          type="button"
          onClick={() => {
            setFile(null)
            setResult(null)
            setError(null)
          }}
          className="inline-flex items-center justify-center text-sm font-medium hover:text-primary transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-destructive bg-destructive/10 border-2 border-destructive/50 rounded-md p-4 animate-slide-up-bounce"
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="grid gap-4 animate-slide-up-bounce">
          <div className="rounded-lg border-2 border-accent/30 bg-accent/5 p-4">
            <div className="text-sm font-semibold mb-2 text-accent">Public image URL</div>
            <a
              href={result.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline break-all hover:text-accent transition-colors"
            >
              {result.publicUrl}
            </a>
          </div>
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
            <div className="text-sm font-semibold mb-2 text-primary">Extracted & cleaned text</div>
            <textarea
              className="w-full h-56 rounded-md border-2 p-3 bg-background font-mono text-sm focus:border-primary transition-colors"
              value={result.text}
              readOnly
            />
          </div>
        </div>
      )}
    </section>
  )
}
