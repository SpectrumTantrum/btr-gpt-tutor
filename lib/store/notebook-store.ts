import { create } from "zustand"
import type { Notebook, NotebookRecord } from "@/lib/core/types"

interface NotebookState {
  readonly notebooks: readonly Notebook[]
  readonly activeNotebookId: string | null
  readonly records: readonly NotebookRecord[]
  setNotebooks: (notebooks: readonly Notebook[]) => void
  addNotebook: (notebook: Notebook) => void
  removeNotebook: (id: string) => void
  setActiveNotebook: (id: string | null) => void
  setRecords: (records: readonly NotebookRecord[]) => void
  addRecord: (record: NotebookRecord) => void
}

export const useNotebookStore = create<NotebookState>((set) => ({
  notebooks: [],
  activeNotebookId: null,
  records: [],
  setNotebooks: (notebooks) => set({ notebooks: [...notebooks] }),
  addNotebook: (notebook) =>
    set((state) => ({ notebooks: [...state.notebooks, notebook] })),
  removeNotebook: (id) =>
    set((state) => ({
      notebooks: state.notebooks.filter((n) => n.id !== id),
      activeNotebookId: state.activeNotebookId === id ? null : state.activeNotebookId,
    })),
  setActiveNotebook: (id) => set({ activeNotebookId: id }),
  setRecords: (records) => set({ records: [...records] }),
  addRecord: (record) =>
    set((state) => ({ records: [...state.records, record] })),
}))
