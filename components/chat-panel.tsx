"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Send, Sparkles, StopCircle } from "lucide-react"

type Role = "user" | "assistant" | "system"
type Message = { id: string; role: Role; content: string }

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const placeholder = useMemo(() => "Ask me to explain code, generate functions, or help debug…", [])

  async function sendMessage(text: string) {
    const trimmed = (text ?? "").trim()
    if (!trimmed) return

    const userMsg: Message = { id: `${Date.now()}-u`, role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const data = (await res.json()) as { message?: { id?: string; role?: Role; content?: string } }
      const content = typeof data?.message?.content === "string" ? data.message.content : ""
      const assistantMsg: Message = {
        id: data?.message?.id || `${Date.now()}-a`,
        role: "assistant",
        content,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      console.log("[v0] Chat error:", (err as Error)?.message)
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-e`, role: "assistant", content: "Sorry, I ran into an issue. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="flex h-[calc(100vh-9rem)] flex-col rounded-lg border-2 bg-card gaming-card-hover">
      <div className="flex items-center justify-between border-b-2 bg-gradient-to-r from-primary/5 via-accent/5 to-accent-2/5 px-4 py-3">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Chat Assistant
          </h3>
          <p className="text-xs text-muted-foreground">Chat and code assistance powered by AI</p>
        </div>
        {isLoading ? (
          <Button variant="outline" size="sm" onClick={() => {}} className="gaming-button-hover">
            <StopCircle className="h-4 w-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Write a TypeScript function that reverses a string.")}
            className="gaming-button-hover"
          >
            Try prompt
          </Button>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-md border-2 border-primary/20 bg-primary/5 p-6 text-sm animate-pixelate-in">
            <Sparkles className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium mb-1">Start chatting to get code snippets, explanations, and refactors.</p>
            <p className="text-muted-foreground text-xs">Use triple backticks to format code.</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={m.id} className="animate-slide-up-bounce" style={{ animationDelay: `${idx * 50}ms` }}>
            <MessageBubble role={m.role} content={m.content} />
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const value = (input ?? "").trim()
          if (!value) return
          void sendMessage(value)
        }}
        className="border-t-2 p-4 bg-muted/20"
      >
        <div className="flex items-end gap-2">
          <Input
            value={input ?? ""}
            onChange={(e) => setInput(e.target.value ?? "")}
            placeholder={placeholder}
            className="flex-1 border-2 focus:border-primary transition-colors"
          />
          <Button type="submit" disabled={isLoading || !(input ?? "").trim()} className="gaming-button-hover">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Press Enter to send • Use \`\`\`lang for code blocks</p>
      </form>
    </section>
  )
}

function MessageBubble({ role, content }: { role: Role; content: any }) {
  const isUser = role === "user"
  const blocks = splitCodeBlocks(getMessageText(content))

  return (
    <div
      className={cn(
        "rounded-lg border-2 p-4 text-sm transition-all",
        isUser
          ? "bg-background border-primary/30 ml-8"
          : "bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 mr-8",
      )}
    >
      <div className="mb-2 text-xs font-bold uppercase tracking-wide opacity-70">{isUser ? "You" : "AI Assistant"}</div>
      <div className="space-y-3">
        {blocks.map((b, i) =>
          b.type === "code" ? (
            <pre key={i} className="overflow-x-auto rounded-md border-2 bg-background p-3 text-xs font-mono">
              <CodeHeader lang={b.lang} code={b.code} />
              <code>{b.code}</code>
            </pre>
          ) : (
            <p key={i} className="whitespace-pre-wrap leading-relaxed">
              {b.text}
            </p>
          ),
        )}
      </div>
    </div>
  )
}

function CodeHeader({ lang, code }: { lang?: string; code: string }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground border-b pb-2">
      <span className="font-semibold uppercase">{lang ? `${lang} code` : "code"}</span>
      <button
        type="button"
        className="rounded border px-2 py-1 hover:bg-muted transition-colors gaming-button-hover"
        onClick={() => navigator.clipboard.writeText(code)}
      >
        Copy
      </button>
    </div>
  )
}

function getMessageText(content: any): string {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    try {
      return content
        .map((part: any) => (typeof part === "string" ? part : typeof part?.text === "string" ? part.text : ""))
        .join("")
    } catch {
      return ""
    }
  }
  if (content && typeof content === "object" && "text" in content && typeof (content as any).text === "string") {
    return (content as any).text
  }
  try {
    return JSON.stringify(content ?? "")
  } catch {
    return ""
  }
}

function splitCodeBlocks(
  text = "",
): Array<{ type: "code"; lang?: string; code: string } | { type: "text"; text: string }> {
  const regex = /```(\w+)?\n([\s\S]*?)```/g
  const parts: Array<any> = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: text.slice(lastIndex, match.index) })
    }
    parts.push({ type: "code", lang: match[1], code: (match[2] ?? "").trim() })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", text: text.slice(lastIndex) })
  }
  return parts
}
