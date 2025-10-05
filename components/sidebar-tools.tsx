"use client"

import Link from "next/link"

type Tool = { href: string; name: string }

export function SidebarTools({ tools }: { tools: Tool[] }) {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-semibold tracking-tight">Tools</h2>
        <p className="text-xs text-muted-foreground">Quick access</p>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {tools.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t text-xs text-muted-foreground">Enhanced theme enabled</div>
    </aside>
  )
}
