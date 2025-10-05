import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    version: "v1",
    name: "Sparkhelp API",
    docs: "/api/v1",
    endpoints: ["/api/v1/health", "/api/v1/generate"],
    providers: {
      google: "images/vision",
      groq: "text (primary)",
      openrouter: "text (fallback)",
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
