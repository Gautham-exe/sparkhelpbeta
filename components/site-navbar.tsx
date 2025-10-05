"use client"

import Link from "next/link"

export default function SiteNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-block-pop">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Pixel-style brand with subtle glow and playful hover motion */}
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-wider text-accent animate-glow-pulse hover-tilt"
          >
            Sparkhelp
          </Link>
          <div className="hidden gap-6 md:flex">
            <Link href="/" className="text-sm font-medium transition-colors gaming-button-hover hover:text-primary">
              Home
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium transition-colors gaming-button-hover hover:text-primary"
            >
              Courses
            </Link>
            <Link
              href="/notes"
              className="text-sm font-medium transition-colors gaming-button-hover hover:text-primary"
            >
              Notes
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors gaming-button-hover hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/planner"
              className="text-sm font-medium transition-colors gaming-button-hover hover:text-primary"
            >
              Planner
            </Link>
            <Link href="/math" className="text-sm font-medium transition-colors gaming-button-hover hover:text-primary">
              Math
            </Link>
            {/* Discord-style CTA with hover motion */}
            <Link href="/status" className="btn-discord discord-glow gaming-button-hover hover-tilt">
              Status
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
