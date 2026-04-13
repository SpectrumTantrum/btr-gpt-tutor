import { create } from "zustand"
import type { AuthUser } from "@/lib/core/types"

interface AuthState {
  readonly user: AuthUser | null
  readonly isAuthenticated: boolean
  readonly isLoading: boolean
  setUser: (user: AuthUser) => void
  clearUser: () => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user: { ...user }, isAuthenticated: true }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))
