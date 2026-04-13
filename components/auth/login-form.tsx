"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isMultiUserMode } from "@/lib/core/auth/middleware"
import { useAuthStore } from "@/lib/store/auth-store"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "An unexpected error occurred"
}

export function LoginForm() {
  const router = useRouter()
  const { setUser, setLoading, isLoading } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!isMultiUserMode()) {
      router.replace("/")
      return
    }

    setLoading(true)
    try {
      const { createSupabaseClient } = await import("@/lib/core/auth/supabase-client")
      const supabase = createSupabaseClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          name: data.user.user_metadata?.full_name as string | undefined,
          avatarUrl: data.user.user_metadata?.avatar_url as string | undefined,
        })
        router.replace("/")
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {error !== null && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  )
}
