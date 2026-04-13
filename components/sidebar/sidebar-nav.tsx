"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  MessageSquare,
  BookOpen,
  Settings,
  GraduationCap,
  NotebookPen,
  Presentation,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/guide", label: "Guide", icon: GraduationCap, iconOnly: true },
  { href: "/notebook", label: "Notebook", icon: NotebookPen, iconOnly: true },
  { href: "/classroom", label: "Classroom", icon: Presentation, iconOnly: true },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-muted/30 p-4 flex flex-col">
      <h1 className="text-lg font-bold">btr-gpt-tutor</h1>
      <nav className="mt-6 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, iconOnly }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!iconOnly && label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
