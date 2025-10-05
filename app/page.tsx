"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Zap, BookOpen, Calculator, MessageSquare, ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChatPanel } from "@/components/chat-panel"

const tools = [
  { href: "/handwriting", name: "Handwriting → Text" },
  { href: "/voice", name: "Voice → Text" },
  { href: "/evaluator", name: "Photo Evaluation" },
  { href: "/editor", name: "Voice Editor" },
  { href: "/reader", name: "Reading Assistant" },
  { href: "/homework", name: "Homework Helper" },
  { href: "/math", name: "Math Solver" },
  { href: "/summary", name: "Summary Maker" },
  { href: "/translator", name: "Translator" },
  { href: "/diagram", name: "Diagram Converter" },
  { href: "/study", name: "Study Mode" },
  { href: "/essay", name: "Essay Checker" },
  { href: "/concept", name: "Concept Explainer" },
  { href: "/voice-code", name: "Voice → Code" },
  { href: "/visual", name: "Visual Solver" },
  { href: "/organizer", name: "Note Organizer" },
  { href: "/planner", name: "Revision Planner" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight group">
          <div className="animate-spark-float">
            <Zap className="h-6 w-6 text-accent-2 fill-accent-2" />
          </div>
          <span className="bg-gradient-to-r from-primary via-accent to-accent-2 bg-clip-text text-transparent">
            Spark Help
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/planner" className="text-sm font-medium hover:text-accent transition-colors">
            Planner
          </Link>
          <Link href="/math" className="text-sm font-medium hover:text-accent-2 transition-colors">
            Math Solver
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gaming-button-hover bg-transparent">
                <Sparkles className="h-4 w-4 mr-2" />
                All Tools
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto w-56">
              {tools.map((tool) => (
                <DropdownMenuItem key={tool.href} asChild>
                  <Link href={tool.href} className="cursor-pointer">
                    {tool.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="gaming-button-hover bg-transparent">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-3 mt-6">
                <Link href="/" onClick={() => setOpen(false)} className="hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/planner" onClick={() => setOpen(false)} className="hover:text-accent transition-colors">
                  Planner
                </Link>
                <Link href="/math" onClick={() => setOpen(false)} className="hover:text-accent-2 transition-colors">
                  Math Solver
                </Link>
                <div className="mt-4 border-t pt-3">
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">All Tools</p>
                  {tools.map((tool) => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className="block py-1 text-sm hover:text-primary transition-colors"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default function Page() {
  const featuredTools = [
    { href: "/math", name: "Math Solver", icon: Calculator, color: "text-accent-2" },
    { href: "/homework", name: "Homework Helper", icon: BookOpen, color: "text-accent" },
    { href: "/handwriting", name: "Handwriting → Text", icon: ImageIcon, color: "text-primary" },
    { href: "/study", name: "Study Mode", icon: MessageSquare, color: "text-accent-2" },
  ]

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 flex items-center gap-2 md:hidden">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Menu</span>
        </div>

        <section className="mb-8 animate-pixelate-in">
          <div className="rounded-lg border bg-gradient-to-br from-card via-card to-primary/5 p-8 gaming-card-hover animate-glow-pulse">
            <div className="flex items-start gap-4">
              <div className="animate-spark-float">
                <Zap className="h-12 w-12 text-accent-2 fill-accent-2" />
              </div>
              <div className="flex-1">
                <h1 className="text-balance text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-accent-2 bg-clip-text text-transparent">
                  Power Up Your Learning with AI
                </h1>
                <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
                  17 AI-powered tools to help you study smarter. From handwriting recognition to math solving, we've got
                  you covered.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 animate-slide-up-bounce">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTools.map((tool, idx) => (
              <Link key={tool.href} href={tool.href} className="group" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="rounded-lg border bg-card p-6 gaming-card-hover hover:border-primary transition-all">
                  <tool.icon className={`h-8 w-8 mb-3 ${tool.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="animate-slide-up-bounce" style={{ animationDelay: "400ms" }}>
          <ChatPanel />
        </section>
      </div>
    </>
  )
}
