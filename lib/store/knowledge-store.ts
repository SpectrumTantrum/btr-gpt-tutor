import { create } from "zustand"
import type { KnowledgeBase } from "@/lib/core/types"

interface KnowledgeState {
  readonly knowledgeBases: readonly KnowledgeBase[]
  readonly isLoading: boolean
  setKnowledgeBases: (kbs: readonly KnowledgeBase[]) => void
  addKnowledgeBase: (kb: KnowledgeBase) => void
  removeKnowledgeBase: (id: string) => void
  setLoading: (isLoading: boolean) => void
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  knowledgeBases: [],
  isLoading: false,
  setKnowledgeBases: (kbs) => set({ knowledgeBases: [...kbs] }),
  addKnowledgeBase: (kb) =>
    set((state) => ({ knowledgeBases: [...state.knowledgeBases, kb] })),
  removeKnowledgeBase: (id) =>
    set((state) => ({
      knowledgeBases: state.knowledgeBases.filter((kb) => kb.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
