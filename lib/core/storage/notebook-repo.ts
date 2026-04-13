import { nanoid } from "nanoid"
import type { Notebook, NotebookRecord } from "@/lib/core/types"
import type { NotebookRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

export class DexieNotebookRepository implements NotebookRepository {
  constructor(private readonly db: TutorDatabase) {}

  async listNotebooks(): Promise<Notebook[]> {
    return this.db.notebooks.toArray()
  }

  async getNotebook(id: string): Promise<Notebook | null> {
    const notebook = await this.db.notebooks.get(id)
    return notebook ?? null
  }

  async createNotebook(data: Omit<Notebook, "id">): Promise<Notebook> {
    const notebook: Notebook = { ...data, id: `nb_${nanoid()}` }
    await this.db.notebooks.add(notebook)
    return notebook
  }

  async updateNotebook(id: string, data: Partial<Omit<Notebook, "id">>): Promise<Notebook> {
    await this.db.notebooks.update(id, data)
    const updated = await this.db.notebooks.get(id)
    if (!updated) throw new Error(`Notebook ${id} not found`)
    return updated
  }

  async deleteNotebook(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.notebooks, this.db.notebookRecords],
      async () => {
        await this.db.notebookRecords.where("notebookId").equals(id).delete()
        await this.db.notebooks.delete(id)
      }
    )
  }

  async addRecord(data: Omit<NotebookRecord, "id">): Promise<NotebookRecord> {
    const record: NotebookRecord = { ...data, id: `rec_${nanoid()}` }
    await this.db.notebookRecords.add(record)
    return record
  }

  async getRecords(notebookId: string): Promise<NotebookRecord[]> {
    return this.db.notebookRecords.where("notebookId").equals(notebookId).toArray()
  }

  async deleteRecord(id: string): Promise<void> {
    await this.db.notebookRecords.delete(id)
  }
}
