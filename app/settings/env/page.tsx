"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function EnvSettingsPage() {
  const { data, error, isLoading } = useSWR("/api/env/status", fetcher)

  const Row = ({ label, ok }: { label: string; ok: boolean }) => (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm">{label}</span>
      {ok ? (
        <Badge variant="outline" className="border-green-600 text-green-700 dark:border-green-400 dark:text-green-300">
          Present
        </Badge>
      ) : (
        <Badge variant="outline" className="border-red-600 text-red-700 dark:border-red-400 dark:text-red-300">
          Missing
        </Badge>
      )}
    </div>
  )

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-pretty text-2xl font-semibold tracking-tight">
            Environment & Integrations
          </CardTitle>
          <CardDescription className="text-pretty">
            Verify required secrets and integrations. Add or update values in the Gear icon &gt; Environment Variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isLoading ? <div>Loading status…</div> : null}
          {error ? <div className="text-red-600">Failed to load env status.</div> : null}
          {data ? (
            <>
              <section className="grid gap-3">
                <h3 className="text-lg font-medium">Groq</h3>
                <Row label="GROQ_API_KEY" ok={Boolean(data?.groq?.GROQ_API_KEY)} />
                <p className="text-sm text-muted-foreground">
                  To integrate Groq, ensure the Groq integration is connected and GROQ_API_KEY is set. By default, text
                  generation uses the Groq model “mixtral-8x7b-32768”. You can override this by adding a “GROQ_MODEL”
                  environment variable.
                </p>
              </section>

              <section className="grid gap-3">
                <h3 className="text-lg font-medium">Supabase (optional features)</h3>
                <Row label="SUPABASE_URL" ok={Boolean(data?.supabase?.SUPABASE_URL)} />
                <Row label="SUPABASE_SERVICE_ROLE_KEY" ok={Boolean(data?.supabase?.SUPABASE_SERVICE_ROLE_KEY)} />
                <Row label="NEXT_PUBLIC_SUPABASE_URL" ok={Boolean(data?.supabase?.NEXT_PUBLIC_SUPABASE_URL)} />
                <Row
                  label="NEXT_PUBLIC_SUPABASE_ANON_KEY"
                  ok={Boolean(data?.supabase?.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
                />
                <p className="text-sm text-muted-foreground">
                  Add these if you plan to use storage/auth. Server-side keys should never be exposed on the client.
                </p>
              </section>

              <section className="grid gap-2">
                <h3 className="text-lg font-medium">How to add secrets</h3>
                <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                  <li>Open the Gear icon in the top-right.</li>
                  <li>Go to Environment Variables and add/update the keys above.</li>
                  <li>
                    If using an Integration (e.g., Groq), ensure it’s connected; it will manage the key automatically.
                  </li>
                </ol>
              </section>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
