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
    <footer className="mt-12 py-6 border-t-2 border-primary bg-secondary text-secondary-foreground shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
      <div className="h-1 w-full bg-primary/70" aria-hidden="true" />
      <div className="container mx-auto px-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-foreground">Contacts</h3>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>
                Github -{" "}
                <a
                  href="https://github.com/Gautham-exe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label="Open Github profile in a new tab"
                >
                  @Gautham-exe
                </a>
              </li>
              <li>
                Discord -{" "}
                <a
                  href="https://discord.gg/5AQH66Y4EB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label="Open Discord invite in a new tab"
                >
                  https://discord.gg/5AQH66Y4EB
                </a>
              </li>
              <li>
                Email -{" "}
                <a href="mailto:dev.sparkco@gmail.com" className="text-primary hover:underline">
                  dev.sparkco@gmail.com
                </a>
              </li>
              <li>
                YouTube -{" "}
                <a
                  href="https://www.youtube.com/@spark.Gautham"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  aria-label="Open YouTube channel in a new tab"
                >
                  https://www.youtube.com/@spark.Gautham
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Business Address</h3>
            <p className="mt-2 text-muted-foreground">
              Banglore x Udupi, Karnataka, India
              <br />
              560051 x 560043 x 576107
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Ownership</h3>
            <p className="mt-2 text-muted-foreground">Owner - Gautham B</p>
            <p className="text-muted-foreground">
              Owner Email -{" "}
              <a href="mailto:Gautham.yml@gmail.com" className="text-primary hover:underline">
                Gautham.yml@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm text-foreground/80 font-mono">
          {displayText}
          <span className="animate-pulse">|</span>
        </p>
      </div>
    </footer>
  )
}
