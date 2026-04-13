import { create } from "zustand"
import type { TutorBot } from "@/lib/core/types"

// ============================================================
// State interface
// ============================================================

interface TutorBotState {
  readonly bots: readonly TutorBot[]
  readonly activeBotId: string | null

  readonly setBots: (bots: readonly TutorBot[]) => void
  readonly addBot: (bot: TutorBot) => void
  readonly removeBot: (id: string) => void
  readonly setActiveBot: (id: string | null) => void
  readonly updateBot: (id: string, updates: Partial<TutorBot>) => void
}

// ============================================================
// Store
// ============================================================

export const useTutorBotStore = create<TutorBotState>((set) => ({
  bots: [],
  activeBotId: null,

  setBots: (bots) => set({ bots: [...bots] }),

  addBot: (bot) =>
    set((state) => ({
      bots: [...state.bots, bot],
    })),

  removeBot: (id) =>
    set((state) => ({
      bots: state.bots.filter((b) => b.id !== id),
      activeBotId: state.activeBotId === id ? null : state.activeBotId,
    })),

  setActiveBot: (id) => set({ activeBotId: id }),

  updateBot: (id, updates) =>
    set((state) => ({
      bots: state.bots.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),
}))
