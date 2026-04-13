import type { Notebook, NotebookRecord } from "@/lib/core/types"
import type { NotebookRepository } from "@/lib/core/storage/repository"

type CreateNotebookInput = Pick<Notebook, "name" | "description" | "color">

type SaveRecordInput = Pick<NotebookRecord, "title" | "content" | "source" | "tags"> & {
  sourceId?: string
}

export class NotebookService {
  constructor(private readonly repo: NotebookRepository) {}

  async listNotebooks(): Promise<Notebook[]> {
    return this.repo.listNotebooks()
  }

  async getNotebook(id: string): Promise<Notebook | null> {
    return this.repo.getNotebook(id)
  }

  async createNotebook(input: CreateNotebookInput): Promise<Notebook> {
    const now = Date.now()
    return this.repo.createNotebook({
      name: input.name,
      description: input.description,
      color: input.color,
      recordCount: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  async updateNotebook(id: string, data: Partial<CreateNotebookInput>): Promise<Notebook> {
    return this.repo.updateNotebook(id, { ...data, updatedAt: Date.now() })
  }

  async deleteNotebook(id: string): Promise<void> {
    return this.repo.deleteNotebook(id)
  }

  async saveRecord(notebookId: string, input: SaveRecordInput): Promise<NotebookRecord> {
    const record = await this.repo.addRecord({
      notebookId,
      title: input.title,
      content: input.content,
      source: input.source,
      sourceId: input.sourceId,
      tags: input.tags,
      createdAt: Date.now(),
    })

    const notebook = await this.repo.getNotebook(notebookId)
    if (notebook) {
      await this.repo.updateNotebook(notebookId, {
        recordCount: notebook.recordCount + 1,
        updatedAt: Date.now(),
      })
    }

    return record
  }

  async getRecords(notebookId: string): Promise<NotebookRecord[]> {
    return this.repo.getRecords(notebookId)
  }

  async deleteRecord(id: string): Promise<void> {
    return this.repo.deleteRecord(id)
  }
}
