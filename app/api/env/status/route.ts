import { NextResponse } from "next/server"

export async function GET() {
  const status = {
    groq: {
      GROQ_API_KEY: Boolean(process.env.GROQ_API_KEY),
    },
    supabase: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
  }
  return NextResponse.json(status)
}
