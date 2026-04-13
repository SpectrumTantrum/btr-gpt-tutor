import { create } from "zustand"
import type { Message, Citation } from "@/lib/core/types"

interface ChatState {
  readonly messages: readonly Message[]
  readonly isStreaming: boolean
  readonly currentCitations: readonly Citation[]
  readonly selectedKnowledgeBaseIds: readonly string[]
  setMessages: (messages: readonly Message[]) => void
  addMessage: (message: Message) => void
  setStreaming: (isStreaming: boolean) => void
  setCitations: (citations: readonly Citation[]) => void
  setSelectedKbs: (ids: readonly string[]) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  currentCitations: [],
  selectedKnowledgeBaseIds: [],
  setMessages: (messages) => set({ messages: [...messages] }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setCitations: (citations) => set({ currentCitations: [...citations] }),
  setSelectedKbs: (ids) => set({ selectedKnowledgeBaseIds: [...ids] }),
  clearChat: () =>
    set({ messages: [], currentCitations: [], isStreaming: false }),
}))
