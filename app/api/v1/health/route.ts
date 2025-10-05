import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "v1",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
}
