"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { isMultiUserMode } from "@/lib/core/auth/middleware"
import { useAuthStore } from "@/lib/store/auth-store"

function getInitials(name?: string, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return "?"
}

export function UserMenu() {
  const router = useRouter()
  const { user, isAuthenticated, clearUser } = useAuthStore()

  if (!isMultiUserMode()) {
    return (
      <div className="flex items-center gap-2 px-1 py-2">
        <span className="text-xs text-muted-foreground">Personal Mode</span>
      </div>
    )
  }

  async function handleLogout() {
    try {
      const { createSupabaseClient } = await import("@/lib/core/auth/supabase-client")
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
    } catch {
      // sign-out best-effort; always clear local state
    } finally {
      clearUser()
      router.replace("/login")
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const initials = getInitials(user.name, user.email)

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        title={user.name ?? user.email}
        aria-label={`Logged in as ${user.name ?? user.email}`}
      >
        {initials}
      </div>
      <span className="flex-1 truncate text-xs font-medium">
        {user.name ?? user.email}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        title="Sign out"
        aria-label="Sign out"
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  )
}
