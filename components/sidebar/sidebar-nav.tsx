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
  PenLine,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserMenu } from "@/components/auth/user-menu"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/guide", label: "Guide", icon: GraduationCap },
  { href: "/notebook", label: "Notebook", icon: NotebookPen },
  { href: "/classroom", label: "Classroom", icon: Presentation },
  { href: "/co-writer", label: "Co-Writer", icon: PenLine },
  { href: "/tutorbot", label: "TutorBot", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-muted/30 p-4 flex flex-col">
      <h1 className="text-lg font-bold">btr-gpt-tutor</h1>
      <div className="mt-3 border-t border-border pt-3">
        <UserMenu />
      </div>
      <nav className="mt-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
