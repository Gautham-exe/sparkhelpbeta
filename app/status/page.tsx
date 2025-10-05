"use client"

import Link from "next/link"

export default function StatusPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
        <span aria-hidden="true" className="text-2xl animate-bounce">
          ⚡
        </span>
        <span>Spark Help</span>
        <span aria-hidden="true" className="text-2xl animate-bounce">
          ⚡
        </span>
      </h1>
      <h2 className="mt-2 text-xl font-semibold text-foreground flex items-center gap-2">
        <span aria-hidden="true" className="animate-pulse">
          📡
        </span>
        <span>Status</span>
        <span aria-hidden="true" className="animate-pulse">
          📡
        </span>
      </h2>

      <div className="mt-6 rounded-lg border bg-card p-6 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-4 -left-2 text-6xl animate-spin-slow">✨</div>
          <div className="absolute bottom-4 right-6 text-5xl animate-float-slow">💫</div>
        </div>
        <p className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-green-500 animate-pulse" aria-hidden="true">
            ●
          </span>
          WEBSITE _ ONLINE
        </p>
        <ul className="mt-4 space-y-2 text-foreground">
          <li className="flex items-center gap-2">
            <span aria-hidden="true">🟣</span> Discord - Online
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">🔴</span> Youtube - Online
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">✉️</span> E-Mail - Online
          </li>
        </ul>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        Need help?{" "}
        <Link
          href="https://discord.gg/5AQH66Y4EB"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Join our Discord
        </Link>
      </div>
    </main>
  )
}
