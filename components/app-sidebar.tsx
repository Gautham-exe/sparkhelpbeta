"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

type Tool = {
  name: string
  href: string
}

export function AppSidebar({ tools }: { tools: Tool[] }) {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" className="border-r bg-card/70 backdrop-blur mc-grid animate-pixelate-in pixel-border">
      <SidebarHeader className="px-3 py-4 animate-slide-up-bounce">
        <div className="text-lg font-serif font-semibold tracking-tight text-accent discord-glow px-2 py-1 rounded-md inline-block">
          Sparkhelp
        </div>
        <div className="text-xs text-muted-foreground">Quick access</div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>All Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((t) => {
                const isActive = pathname === t.href
                return (
                  <SidebarMenuItem key={t.href}>
                    <SidebarMenuButton asChild isActive={isActive} className="gaming-card-hover hover-tilt">
                      <Link href={t.href}>
                        <span>{t.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
      </SidebarContent>

      <SidebarFooter className="px-3 py-4 text-xs text-muted-foreground">
        <div>Use the sidebar to switch features.</div>
      </SidebarFooter>
    </Sidebar>
  )
}
