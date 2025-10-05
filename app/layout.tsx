import type React from "react"
import "./globals.css"
import SiteNavbar from "@/components/site-navbar"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Footer } from "@/components/footer"
import { Press_Start_2P } from "next/font/google"

const geistSans = { variable: GeistSans.variable }
const geistMono = { variable: GeistMono.variable }
const pixelHeading = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
})

export const metadata = {
  title: "Spark Help - AI Learning Assistant",
  description: "17 powerful AI tools for students - handwriting recognition, math solver, homework helper, and more",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${pixelHeading.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground font-sans mc-grid">
        <SidebarProvider>
          <AppSidebar tools={tools} />
          <SidebarInset>
            <SiteNavbar />
            <main className="p-6 animate-pixelate-in">
              {children}
              <Footer />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
