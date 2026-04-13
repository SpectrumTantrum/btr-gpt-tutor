import { create } from "zustand"
import type { CoWriterOperation } from "@/lib/core/types"

interface HistoryEntry {
  readonly content: string
  readonly timestamp: number
}

interface CoWriterState {
  readonly content: string
  readonly selectedText: string
  readonly selectionStart: number
  readonly selectionEnd: number
  readonly knowledgeBaseId: string | null
  readonly isStreaming: boolean
  readonly history: readonly HistoryEntry[]
  setContent: (content: string) => void
  setSelection: (text: string, start: number, end: number) => void
  clearSelection: () => void
  setKnowledgeBaseId: (id: string | null) => void
  setIsStreaming: (isStreaming: boolean) => void
  pushHistory: (content: string) => void
  undo: () => void
  replaceSelection: (replacement: string) => void
}

export const useCoWriterStore = create<CoWriterState>((set, get) => ({
  content: "",
  selectedText: "",
  selectionStart: 0,
  selectionEnd: 0,
  knowledgeBaseId: null,
  isStreaming: false,
  history: [],

  setContent: (content) => set({ content }),

  setSelection: (text, start, end) =>
    set({ selectedText: text, selectionStart: start, selectionEnd: end }),

  clearSelection: () =>
    set({ selectedText: "", selectionStart: 0, selectionEnd: 0 }),

  setKnowledgeBaseId: (id) => set({ knowledgeBaseId: id }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  pushHistory: (content) =>
    set((state) => ({
      history: [
        ...state.history,
        { content, timestamp: Date.now() },
      ].slice(-50),
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state
      const previous = state.history[state.history.length - 1]
      return {
        content: previous.content,
        history: state.history.slice(0, -1),
      }
    }),

  replaceSelection: (replacement) => {
    const { content, selectionStart, selectionEnd } = get()
    const newContent =
      content.slice(0, selectionStart) +
      replacement +
      content.slice(selectionEnd)
    set({
      content: newContent,
      selectedText: "",
      selectionStart: selectionStart,
      selectionEnd: selectionStart + replacement.length,
    })
  },
}))

export type { CoWriterOperation }
