import { create } from "zustand"
import type { GuidePlan } from "@/lib/core/types"

interface GuideState {
  readonly guides: readonly GuidePlan[]
  readonly activeGuideId: string | null
  setGuides: (guides: readonly GuidePlan[]) => void
  addGuide: (guide: GuidePlan) => void
  setActiveGuide: (id: string | null) => void
  updateGuide: (id: string, updates: Partial<GuidePlan>) => void
}

export const useGuideStore = create<GuideState>((set) => ({
  guides: [],
  activeGuideId: null,
  setGuides: (guides) => set({ guides: [...guides] }),
  addGuide: (guide) =>
    set((state) => ({ guides: [...state.guides, guide] })),
  setActiveGuide: (id) => set({ activeGuideId: id }),
  updateGuide: (id, updates) =>
    set((state) => ({
      guides: state.guides.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),
}))
