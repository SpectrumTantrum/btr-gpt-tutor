import { create } from "zustand"
import type { Session } from "@/lib/core/types"

interface SessionState {
  readonly sessions: readonly Session[]
  readonly activeSessionId: string | null
  setSessions: (sessions: readonly Session[]) => void
  setActiveSession: (id: string | null) => void
  addSession: (session: Session) => void
  removeSession: (id: string) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,
  setSessions: (sessions) => set({ sessions: [...sessions] }),
  setActiveSession: (id) => set({ activeSessionId: id }),
  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),
  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId:
        state.activeSessionId === id ? null : state.activeSessionId,
    })),
}))
