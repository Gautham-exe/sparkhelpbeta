"use client"

import { useEffect, useState } from "react"

export function Footer() {
  const [displayText, setDisplayText] = useState("")
  const fullText = "© All Rights reserved | 2025 Spark.Co"

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 50) // 50ms per character for typewriter effect

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="mt-12 py-6 border-t border-border">
      <div className="text-center">
        <p className="text-sm text-muted-foreground font-mono">
          {displayText}
          <span className="animate-pulse">|</span>
        </p>
      </div>
    </footer>
  )
}
