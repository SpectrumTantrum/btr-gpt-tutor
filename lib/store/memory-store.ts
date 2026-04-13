import { create } from "zustand"
import type { Memory } from "@/lib/core/types"

interface MemoryState {
  readonly memory: Memory | null
  setMemory: (memory: Memory | null) => void
}

export const useMemoryStore = create<MemoryState>((set) => ({
  memory: null,
  setMemory: (memory) => set({ memory }),
}))
